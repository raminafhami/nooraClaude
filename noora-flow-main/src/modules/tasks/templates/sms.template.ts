export const SMS_TEMPLATE = {
  '100': (data: any) => {
    const message = 'سلام %name%';
    const regex = new RegExp('%(' + Object.keys(data).join('|') + ')%', 'g');
    // if (message.match(regex).length != 1) {
    //   return { error: 'you should send all params' };
    // }
    // return {
    //   error: false,
    //   message:
    // };
    return message.replace(regex, (m, $1) => data[$1] || m);
  },
};
