export const doMockAxiosError = (
  status: number,
  message: string,
  errorCode: string
) => ({
  response: {
    status,
    data: {
      errorCode,
      message,
    },
  },
});

export const doMockAxiosSuccess = (status: number, text: string) => ({
  status,
  statusText: text,
});
