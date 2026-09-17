import { Injectable } from '@nestjs/common';
import { _ } from 'lodash';
import { SMS_TEMPLATE } from '../templates/sms.template';
import crypto from 'crypto';

export enum CONNECTOR_KEY {
  SEND_SMS = 'send-sms',
  BANK_GATEWAY_TOKEN = 'bank-gateway-token',
  VERIFY_PAYMENT = 'verify-payment',
}

export enum TRANSACTION_TYPES {
  PURCHASE = 'Purchase',
}

interface IKCInterface {
  transactionType: string;
  amount: string;
}

interface IKCConfirmationInterface {
  tokenIdentity: string;
  acceptorId?: string;
  responseCode?: string;
  paymentId?: string;
  RequestId?: string;
  sha256OfPan?: string;
  retrievalReferenceNumber: string;
  maskedPan?: string;
  systemTraceAuditNumber: string;
}

@Injectable()
export class ConnectorConfig {
  // constructor() {}
  connectorValueLocator(parameters, path: any) {
    // '$[parameters.value]'
    if (
      typeof path === 'string' &&
      path.startsWith('$[') &&
      path.endsWith(']')
    ) {
      path = path.slice(2, -1);

      const _path = path.split('.');

      _path.shift();
      const newPath = _path.join('.');

      return _.get(parameters, newPath);
    }
    return path;
  }

  getSmsConfig(configData: any, parameters: any) {
    if (configData?.body) {
      configData.body = Object.entries(configData.body).reduce((acc, cur) => {
        return {
          ...acc,
          [cur[0]]: this.connectorValueLocator(parameters, cur[1]),
        };
      }, {});
    }

    if (configData?.params) {
      configData.params = Object.entries(configData.params).reduce(
        (acc, cur) => {
          return {
            ...acc,
            [cur[0]]: this.connectorValueLocator(parameters, cur[1]),
          };
        },
        {},
      );
    }
    const config = {} as any;

    config.url = 'https://rest.payamak-panel.com/api/SendSMS/SendSMS';
    config.method = 'post';
    config.data = {
      username: '9121030046',
      password: 'Noora&Negin@2020',
      from: '90005416',
      to: configData.body.phoneNumber,
      text: SMS_TEMPLATE[configData.body.templateId](configData?.body),
    };
    return config;
  }

  getBankGatewayTokenConfig(paymentData: IKCInterface) {
    const { transactionType, amount } = paymentData;
    const config = {} as any;
    config.method = 'POST';
    const authenticationEnvelope = this.generateAuthenticationEnvelope(
      amount,
      process.env.TERMINAL_ID,
      process.env.PASS_PHRASE,
    );
    switch (transactionType) {
      case TRANSACTION_TYPES.PURCHASE:
        config.url = 'https://ikc.shaparak.ir/api/v3/tokenization/make';
        config.data = {
          request: {
            transactionType: TRANSACTION_TYPES.PURCHASE,
            terminalId: process.env.TERMINAL_ID,
            acceptorId: process.env.ACCEPTOR_ID,
            amount,
            revertUri: process.env.REVERT_URI,
            requestId: 'Gx1000A545s4gl', //it should generate randomly
            paymentId: '12710', //it should generate randomly
          },
          authenticationEnvelope,
        };
        break;
    }
    return config;
  }

  getPaymentConfirmationConfig(ikcConfirmation: IKCConfirmationInterface) {
    const { retrievalReferenceNumber, tokenIdentity, systemTraceAuditNumber } =
      ikcConfirmation;
    const config = {} as any;
    config.method = 'POST';
    config.url = 'https://ikc.shaparak.ir/api/v3/confirmation/purchase';
    config.data = {
      retrievalReferenceNumber,
      tokenIdentity,
      systemTraceAuditNumber,
    };
    return config;
  }

  padLeftWithZero(size: number, number: string) {
    return number.toString().padStart(size, '0');
  }

  aesEncrypt(inputStr: string) {
    const aesSecretKey = crypto.randomBytes(16);
    const aesInitialVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-128-cbc',
      Buffer.from(aesSecretKey),
      aesInitialVector,
    );
    const aesEncrypted = Buffer.concat([
      cipher.update(Buffer.from(inputStr, 'hex')),
      cipher.final(),
    ]);
    return { aesSecretKey, aesInitialVector, aesEncrypted };
  }

  rsaEncrypt(rsaInput) {
    return crypto.publicEncrypt(
      {
        key: process.env.IKC_PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(rsaInput),
    );
  }

  generateAuthenticationEnvelope(
    amount: string,
    terminalId: string,
    passPhrase: string,
  ) {
    const zeroPadAmount = this.padLeftWithZero(12, amount);
    const inputStr = `${terminalId}${passPhrase}${zeroPadAmount}00`;

    const { aesSecretKey, aesInitialVector, aesEncrypted } =
      this.aesEncrypt(inputStr);
    const aesEncryptedHash = crypto
      .createHash('sha256')
      .update(aesEncrypted)
      .digest();

    const rsaEncrypted = this.rsaEncrypt(
      Buffer.concat([aesSecretKey, aesEncryptedHash]),
    );

    return {
      data: rsaEncrypted.toString('hex'),
      iv: aesInitialVector.toString('hex'),
    };
  }
}
