import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { EmailDocument } from './schemas/email.schema';
import { EmailRepositoryImpl } from './repository/email.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { SendEmailDto } from './dto/send-email.dto';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/services/users.service';
import { EmailConfigService } from 'src/config/email/config.service';
import { ImapFlow, SearchObject } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import { Readable } from 'node:stream';
import { EmailQueryDto } from './dto/email-query.dto';
import { ReplyEmailDto } from './dto/reply-email.dto';
import { ForwardEmailDto } from './dto/forward-email.dto';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthenticationService } from '../iam/authentication/authentication.service';
import { EmailStatus } from 'src/common/const/enums';

export type EmailOptions = ISendMailOptions & {
  id: string;
  userId?: string;
};

@Injectable()
export class EmailService extends CrudService<EmailDocument> {
  private readonly logger = new Logger('EmailService');
  // private clientMap: Map<string, ImapFlow> = new Map();
  private emailSocket: Server;

  constructor(
    private readonly emailRepositoryImpl: EmailRepositoryImpl,
    @InjectQueue('email') private emailQueue: Queue,
    private readonly systemMailerService: MailerService,
    private readonly usersService: UsersService,
    private readonly emailConfigService: EmailConfigService,
    private authService: AuthenticationService,
  ) {
    super(emailRepositoryImpl);
  }

  async sendingSystemEmail(
    userId: string,
    sendEmailDto: SendEmailDto,
    files: any,
  ) {
    return this.createAndQueueEmail(
      {
        from: this.emailConfigService.username,
        to: sendEmailDto.to,
        cc: sendEmailDto.cc,
        bcc: sendEmailDto.bcc,
        subject: sendEmailDto.subject,
        html: sendEmailDto.html,
        attachments: files?.map((f) => {
          return {
            // binary buffer as an attachment
            filename: f.originalname,
            content: f.buffer.toString('base64'),
          };
        }),
      },
      `system:${userId}`,
    );
  }

  async sendingUserEmail(
    userId: string,
    sendEmailDto: SendEmailDto,
    files: any,
  ) {
    const userEmailConfig = await this.usersService.checkEmailConfig(userId);

    if (!userEmailConfig) {
      throw new BadRequestException('you need to configure email.');
    }

    return this.createAndQueueEmail(
      {
        ...sendEmailDto,
        from: userEmailConfig.user,
        attachments: files.map((f) => {
          return {
            // binary buffer as an attachment
            filename: f.originalname,
            content: f.buffer.toString('base64'),
            encoding: 'base64',
          };
        }),
      },
      userId,
    );
  }

  async createAndQueueEmail(emailOptions: ISendMailOptions, userId?: string) {
    const email = await this.createEmail(
      {
        ...emailOptions,
      },
      userId.startsWith('system') ? userId.split(':')[1] : userId,
    );

    await this.addEmailToQueue({
      ...emailOptions,
      id: email.id,
      userId,
    });

    return email;
  }

  async processSystemEmail(emailOptions: EmailOptions) {
    const { client } = await this.connect('system');

    try {
      const emailResult = await this.systemMailerService.sendMail({
        ...emailOptions,
        from: {
          name: 'Noora Azma',
          address: 'automation@naitco.ir',
        },
      });

      await client.append(
        'Sent Items',
        `From: automation@naitco.ir\r\nTo: ${emailOptions.to}\r\nSubject: ${emailOptions.subject}\r\n\r\n${emailOptions.html}`,
        ['\\Seen'],
      );
      await this.updateStatus({
        id: emailOptions.id,
        newStatus: EmailStatus.SUCCESS,
      });

      return emailResult;
    } finally {
      await client.logout();
    }
  }

  async processUserEmail(emailOptions: EmailOptions) {
    const { client, emailConfig } = await this.connect(emailOptions.userId);
    try {
      const transporter = nodemailer.createTransport({
        host: this.emailConfigService.host,
        port: this.emailConfigService.port,
        secure: this.emailConfigService.secure,
        auth: emailConfig,
        tls: {
          rejectUnauthorized: true,
        },
      });
      await transporter.verify();

      const emailResult = await transporter.sendMail({
        ...emailOptions,
        from: {
          address: emailConfig.user,
          name: emailConfig.fullname,
        },
      });
      await this.updateStatus({
        id: emailOptions.id,
        newStatus: EmailStatus.SUCCESS,
      });
      await client.append(
        'Sent Items',
        `From: ${emailConfig.user}\r\nTo: ${emailOptions.to}\r\nSubject: ${emailOptions.subject}\r\n\r\n${emailOptions.html}`,
        ['\\Seen'],
      );
      return emailResult;
    } finally {
      await client.logout();
    }
  }

  async addEmailToQueue(emailOptions: EmailOptions) {
    await this.emailQueue.add(emailOptions, { removeOnComplete: true });
    await this.updateStatus({
      id: emailOptions.id,
      newStatus: EmailStatus.QUEUED,
    });
  }

  private async createEmail(emailOptions: ISendMailOptions, userId?: string) {
    const email = await this.emailRepositoryImpl.create({
      from: emailOptions.from,
      to: emailOptions.to,
      cc: emailOptions.cc,
      bcc: emailOptions.bcc,
      subject: emailOptions.subject,
      body: (emailOptions.text as string) || (emailOptions.html as string),
      status: EmailStatus.PENDING,
      userId,
      isSystem: !userId,
    });
    return email;
  }

  async updateStatus({
    id,
    newStatus,
  }: {
    id: string;
    newStatus: EmailStatus;
  }) {
    const email = await this.findByIdAndUpdate(id, { status: newStatus });

    if (!email) {
      this.logger.error(`Email with id ${id} not found`);
      // throw new NotFoundException();
    }
    return email;
  }

  async connect(
    userId: string,
  ): Promise<{ client: ImapFlow; emailConfig: any }> {
    // if (this.clientMap.has(userId)) {
    //   return this.clientMap.get(userId);
    // }
    let emailConfig = null;
    if (userId === 'system') {
      emailConfig = {
        user: this.emailConfigService.username,
        pass: this.emailConfigService.password,
      };
    } else {
      emailConfig = await this.usersService.getEmailConfig(userId);
    }
    const client = new ImapFlow({
      host: 'mail.naitco.ir',
      port: 993,
      secure: true,
      auth: emailConfig,
      logger: false,
    });
    try {
      await client.connect();
      // this.clientMap.set(userId, client);
      return { client, emailConfig };
    } catch (error) {
      throw new BadRequestException('email or password is incorrect.');
    }
  }

  async listFolders(userId: string): Promise<{
    folders: Array<{ folder: string; unread: number; total: number }>;
    totalUnread: number;
  }> {
    const { client } = await this.connect(userId);
    const results: Array<{ folder: string; unread: number; total: number }> =
      [];
    let totalUnread = 0;
    try {
      const folders = await client.list();
      for (const folder of folders) {
        // Get unseen count for this folder
        const status = await client.status(folder.path, { unseen: true });
        const total = await client.status(folder.path, {
          messages: true,
        });
        const unread = status.unseen || 0;

        results.push({
          folder: folder.path,
          unread,
          total: total.messages,
        });

        totalUnread += unread;
      }
      return { folders: results, totalUnread: totalUnread };
    } finally {
      await client.logout();
    }
  }

  async fetchEmails(
    userId: string,
    folder: string,
    filters: EmailQueryDto,
  ): Promise<{ data: any[]; count: number }> {
    const { client } = await this.connect(userId);
    const lock = await client.getMailboxLock(folder);
    try {
      // Build IMAP search query from filters
      const searchQuery: SearchObject = this.buildSearchQuery(filters);

      // Get matching UIDs (sorted newest first)
      const searchResult = await client.search(searchQuery, { uid: true });
      const uids = searchResult.sort((a, b) => b - a); // Reverse for newest first
      const count = uids.length;

      // Pagination
      const start = filters.page * filters.size + 1;
      const end = start + filters.size - 1;
      const paginatedUids = uids.slice(start - 1, end);

      if (paginatedUids.length === 0) {
        return { data: [], count };
      }
      const messages = client.fetch(paginatedUids.join(','), {
        envelope: true,
        source: true,
        uid: true, // Include UID for later attachment retrieval
        flags: true,
      });

      const emails = [];
      for await (const message of messages) {
        const parsed = await simpleParser(message.source, {
          skipHtmlToText: true,
          skipTextToHtml: true,
          skipImageLinks: true,
        });
        emails.push({
          uid: message.uid, // Store UID for attachment retrieval
          subject: parsed.subject,
          from: parsed.from?.value,
          to: (parsed.to as any)?.value,
          cc: (parsed.cc as any)?.value,
          bcc: (parsed.bcc as any)?.value,
          messageId: parsed.messageId,
          inReplyTo: parsed.inReplyTo,
          references: parsed.references,
          date: parsed.date,
          text: parsed.text,
          html: parsed.html,
          isUnread: !message.flags.has('\\Seen'), // Check if email is unread
          attachments: parsed.attachments.map((att, index) => {
            return {
              filename: att.filename,
              size: att.size,
              contentType: att.contentType,
              index,
            };
          }),
        });
      }
      return { data: emails.reverse(), count };
    } finally {
      lock.release();
      await client.logout(); // Or keep connection open
      // this.clientMap.delete(userId); // Remove from map
    }
  }

  async toggleSeen(
    userId: string,
    messageUid: number,
    folder: string,
    seen = true,
  ): Promise<void> {
    const { client } = await this.connect(userId);

    try {
      // Open the target folder (e.g., INBOX, Spam)
      await client.mailboxOpen(folder);
      const lock = await client.getMailboxLock(folder);

      try {
        const method = seen ? 'messageFlagsAdd' : 'messageFlagsRemove';
        await client[method](messageUid.toString(), ['\\Seen'], {
          uid: true,
        });
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async getAttachment(
    userId: string,
    messageUid: number,
    attachmentIndex: number,
  ): Promise<{ stream: Readable; info: any }> {
    const { client } = await this.connect(userId);
    const lock = await client.getMailboxLock('INBOX');

    try {
      // Fetch specific message by UID
      const message = await client.fetchOne(messageUid.toString(), {
        source: true,
      });

      // Parse WITH attachments content
      const parsed = await simpleParser(message.source);

      if (!parsed.attachments || attachmentIndex >= parsed.attachments.length) {
        throw new NotFoundException('Attachment not found');
      }

      const attachment = parsed.attachments[attachmentIndex];

      return {
        stream: Readable.from(attachment.content),
        info: {
          filename: attachment.filename,
          contentType: attachment.contentType,
          size: attachment.size,
        },
      };
    } finally {
      lock.release();
      await client.logout(); // Or keep connection open
      // this.clientMap.delete(userId); // Remove from map
    }
  }

  private buildSearchQuery(filters: EmailQueryDto): SearchObject {
    const query: SearchObject = {};

    if (filters.subject) {
      query.subject = filters.subject; // Case-insensitive partial match
    }

    if (filters.from) {
      query.from = filters.from;
    }

    if (filters.to) {
      query.to = filters.to;
    }

    if (!!filters?.unread) {
      if (filters.unread === 'true') {
        query.seen = false; // Unread emails only
      } else {
        query.seen = true;
      }
    }

    if (filters.after) {
      query.since = new Date(filters.after);
    }

    if (filters.before) {
      query.before = new Date(filters.before);
    }

    return query;
  }

  async getEmailForReplyOrForward(
    userId: string,
    folder: string,
    messageUid: number,
  ): Promise<any> {
    const { client } = await this.connect(userId);
    const lock = await client.getMailboxLock(folder);

    try {
      // Fetch specific message by UID with full details
      const message = await client.fetchOne(
        messageUid.toString(),
        {
          source: true,
          envelope: true,
          uid: true,
        },
        { uid: true },
      );

      if (!message) {
        throw new NotFoundException('Email not found');
      }

      const parsed = await simpleParser(message.source, {
        skipHtmlToText: false,
        skipTextToHtml: false,
      });

      return {
        uid: message.uid,
        messageId: parsed.messageId,
        subject: parsed.subject,
        from: parsed.from?.value,
        to: (parsed.to as any)?.value,
        cc: (parsed.cc as any)?.value,
        bcc: (parsed.bcc as any)?.value,
        date: parsed.date,
        text: parsed.text,
        html: parsed.html,
        attachments: parsed.attachments.map((att, index) => {
          return {
            filename: att.filename,
            size: att.size,
            contentType: att.contentType,
            index,
          };
        }),
      };
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async replyEmail(userId: string, replyEmailDto: ReplyEmailDto, files: any) {
    const userEmailConfig = await this.usersService.checkEmailConfig(userId);
    if (!userEmailConfig) {
      throw new BadRequestException('You need to configure email.');
    }

    // Get the original email to properly set reply headers
    const originalEmail = await this.getEmailForReplyOrForward(
      userId,
      replyEmailDto.folder,
      replyEmailDto.messageUid,
    );

    // Prepare attachments array
    const attachments =
      files?.map((file) => ({
        filename: file.originalname,
        content: file.buffer.toString('base64'),
        contentType: file.mimetype,
      })) || [];

    // Construct reply subject
    const subject = originalEmail.subject.startsWith('Re:')
      ? originalEmail.subject
      : `Re: ${originalEmail.subject}`;

    // Build reply content with original message
    const quotedContent = `
          <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 0;">
            <p><strong>From:</strong> ${
              originalEmail.from[0]?.address || ''
            }</p>
            <p><strong>Date:</strong> ${
              originalEmail.date?.toISOString() || ''
            }</p>
            <p><strong>Subject:</strong> ${originalEmail.subject}</p>
            ${originalEmail.html}
          </blockquote>
        `;

    // Determine recipients
    const to = replyEmailDto.isReplyAll
      ? [
          originalEmail.from[0].address,
          ...(originalEmail?.to || []).map((t) => t.address),
          ...(originalEmail?.cc || []).map((c) => c.address),
        ].filter(Boolean)
      : [originalEmail.from[0].address];

    // Create a reply email with proper headers
    const replyOptions: ISendMailOptions = {
      from: this.emailConfigService.username,
      to: [...new Set(to)], // Remove duplicates
      cc: replyEmailDto.isReplyAll ? undefined : replyEmailDto.cc,
      subject,
      html: `${replyEmailDto.html}<hr>${quotedContent}`,
      headers: {
        'In-Reply-To': originalEmail.messageId,
        References:
          originalEmail.references?.join(' ') || originalEmail.messageId,
      },
      attachments,
    };

    return this.createAndQueueEmail(replyOptions, userId);
  }

  async forwardEmail(
    userId: string,
    forwardEmailDto: ForwardEmailDto,
    files: any,
  ) {
    const userEmailConfig = await this.usersService.checkEmailConfig(userId);
    if (!userEmailConfig) {
      throw new BadRequestException('You need to configure email.');
    }

    // Get the original email to include in the forwarded message
    const originalEmail = await this.getEmailForReplyOrForward(
      userId,
      forwardEmailDto.folder,
      forwardEmailDto.messageUid,
    );
    // Prepare attachments array
    const attachments = [];

    // Add new files from upload
    if (files?.length) {
      attachments.push(
        ...files.map((file) => ({
          filename: file.originalname,
          content: file.buffer.toString('base64'),
          contentType: file.mimetype,
        })),
      );
    }

    // Include original attachments if requested
    if (
      forwardEmailDto.includeAttachments &&
      originalEmail.attachments?.length
    ) {
      for (const [index, attachment] of originalEmail.attachments.entries()) {
        const { stream, info } = await this.getAttachment(
          userId,
          forwardEmailDto.messageUid,
          index,
        );

        // Convert stream to buffer
        const buffers = [];
        for await (const chunk of stream) buffers.push(chunk);
        const buffer = Buffer.concat(buffers);

        attachments.push({
          filename: info.filename,
          content: buffer.toString('base64'),
          contentType: info.contentType,
        });
      }
    }

    // Construct forward subject
    const subject = originalEmail.subject.startsWith('Fwd:')
      ? originalEmail.subject
      : `Fwd: ${originalEmail.subject}`;

    // Build forwarded content with original message
    const forwardedContent = `
      <p>---------- Forwarded message ----------</p>
      <p>From: ${originalEmail.from[0]?.address || ''}</p>
      <p>Date: ${originalEmail.date?.toISOString() || ''}</p>
      <p>Subject: ${originalEmail.subject}</p>
      <p>To: ${originalEmail.to[0]?.address || ''}</p>
      <br>
      ${originalEmail.html}
    `;

    // Create forward email options
    const forwardOptions: ISendMailOptions = {
      from: this.emailConfigService.username,
      to: forwardEmailDto.to,
      cc: forwardEmailDto.cc,
      bcc: forwardEmailDto.bcc,
      subject,
      html: `${forwardEmailDto.html}<hr>${forwardedContent}`,
      attachments,
    };

    return this.createAndQueueEmail(forwardOptions, userId);
  }

  async getUserFromSocket(client: Socket) {
    const token =
      client.handshake.auth.token || client.handshake.headers.authorization;

    const user = await this.authService.getUserFromToken(token);
    if (!user) {
      throw new WsException({
        status: 'failure',
        description: 'Invalid credentials.',
        statusCode: 401,
      });
    }
    return user;
  }

  emitEmailStatus(userId: string, status: string) {
    this.emailSocket.to(userId).emit('emailStatus', {
      status,
    });
  }

  setSocket(server: Server) {
    this.emailSocket = server;
  }
}
