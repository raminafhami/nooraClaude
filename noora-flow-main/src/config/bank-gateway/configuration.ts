import { registerAs } from '@nestjs/config';
export default registerAs('bankGateway', () => ({
  IKCPublicKey: process.env.IKC_PUBLIC_KEY,
  terminalId: process.env.TERMINAL_ID,
  acceptorId: process.env.ACCEPTOR_ID,
  passPhrase: process.env.PASS_PHRASE,
  revertUri: process.env.REVERT_URI,
}));
