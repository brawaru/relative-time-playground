export function debounce<CallbackT extends (this: any, ...args: any[]) => any>(
  callbackFn: CallbackT,
  interval: number
) {
  let currentTimer: number | undefined;
  return function wrappedCall(
    this: ThisParameterType<CallbackT>,
    ...params: Parameters<CallbackT>
  ) {
    clearTimeout(currentTimer);
    currentTimer = setTimeout(callbackFn.bind(this, ...params), interval);
  };
}
