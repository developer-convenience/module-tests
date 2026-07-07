export const REVEAL_VISIBLE_CLASS = "ls-reveal--visible";
export const REVEAL_GROUP_VISIBLE_CLASS = "ls-reveal-group--visible";

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.08,
  rootMargin: "0px 0px 25% 0px",
};

let observer: IntersectionObserver | null = null;
const onVisibleCallbacks = new WeakMap<Element, () => void>();

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const callback = onVisibleCallbacks.get(entry.target);
        callback?.();
        observer!.unobserve(entry.target);
        onVisibleCallbacks.delete(entry.target);
      }
    }, OBSERVER_OPTIONS);
  }
  return observer;
}

export function observeReveal(
  element: Element,
  onVisible: () => void = () => {
    element.classList.add(REVEAL_VISIBLE_CLASS);
  },
) {
  onVisibleCallbacks.set(element, onVisible);
  getObserver().observe(element);
}

export function unobserveReveal(element: Element) {
  onVisibleCallbacks.delete(element);
  getObserver().unobserve(element);
}

export function observeRevealGroup(element: Element) {
  observeReveal(element, () => {
    element.classList.add(REVEAL_GROUP_VISIBLE_CLASS);
  });
}
