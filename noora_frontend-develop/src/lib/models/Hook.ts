type HookDelegate<T> = (values: T) => Promise<void> | void;

export interface Hook<TActions, TValues> {
  name: TActions;
  delegate: HookDelegate<TValues>;
}

export class HookList<TActions, TValues> {
  private hooks: Hook<TActions, TValues>[];

  constructor() {
    this.hooks = [];
  }

  removeAll(): void {
    this.hooks = [];
  }

  registerHook(name: TActions, delegate: HookDelegate<TValues>): void {
    this.hooks.push({ name, delegate });
  }

  get(name?: TActions): Hook<TActions, TValues>[] {
    if (name) {
      return this.hooks.filter((hook) => hook.name === name);
    }

    return this.hooks;
  }
}
