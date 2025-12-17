import { XPState } from './xp-reducer';

// Selectors for elements we want to auto-update
const SELECTORS = {
    DISPLAY: '[data-xp-display]',
    LEVEL: '[data-level-display]',
    PROGRESS: '[data-xp-progress]',
    NEXT: '[data-xp-next]',
};

/**
 * Updates a single element based on current XP state.
 */
const updateElement = (element: Element, state: XPState) => {
    if (element.hasAttribute('data-xp-display')) {
        element.textContent = state.xp.toLocaleString();
    }

    if (element.hasAttribute('data-level-display')) {
        element.textContent = state.level.toString();
    }

    if (element.hasAttribute('data-xp-next')) {
        element.textContent = state.xpToNextLevel.toLocaleString();
    }

    if (element.hasAttribute('data-xp-progress')) {
        // Recalc logic:
        let xpGap = 100;
        let threshold = 0;
        let nextThreshold = 100;

        while (state.xp >= nextThreshold) {
            threshold = nextThreshold;
            xpGap += 100; // Increment gap by 100
            nextThreshold += xpGap;
        }

        const progressInLevel = state.xp - threshold;
        const percent = Math.min(100, Math.max(0, (progressInLevel / xpGap) * 100));

        (element as HTMLElement).style.width = `${percent}%`;
    }
};

/**
 * Scans the entire document to update existing elements.
 */
export const updateAllXPElements = (state: XPState) => {
    document.querySelectorAll(Object.values(SELECTORS).join(',')).forEach((el) => {
        updateElement(el, state);
    });
};

/**
 * Starts observing the DOM for new elements with our data attributes.
 */
export const startXPObserver = (getCurrentState: () => XPState) => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof Element) {
                    // Check the node itself
                    if (Object.keys(SELECTORS).some(key => node.matches(SELECTORS[key as keyof typeof SELECTORS]))) {
                        updateElement(node, getCurrentState());
                    }
                    // Check children
                    const children = node.querySelectorAll(Object.values(SELECTORS).join(','));
                    children.forEach(child => updateElement(child, getCurrentState()));
                }
            });
        });
    });

    console.log('[XP] DOM Binding Observer has started.');
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    return observer;
};
