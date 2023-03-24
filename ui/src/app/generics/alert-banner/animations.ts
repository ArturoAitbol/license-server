import {
    animate,
    animateChild,
    group,
    query,
    style,
    transition,
    trigger,
} from "@angular/animations";

const transformDuration = 200;   // Desktop (default)
const transformTiming = `${ transformDuration }ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
const fadeInTiming = "150ms 75ms cubic-bezier(0.4, 0.0, 0.2, 1)";
const fadeOutTiming = "150ms cubic-bezier(0.4, 0.0, 0.2, 1)";

// Start at nothing and grow in height until reaching normal size
export const GROW_DOWN_ANIMATION = trigger("growDown", [
    transition(":enter", [
        // Start at 0 height, all children transparent
        style({ height: "0" }),
        query("*", [ style({ opacity: "0" }) ], { optional: true }),
        group([
            // Start growing height, fadeInTiming includes brief delay before opacity kicks in
            animate(transformTiming, style({ height: "*" })),
            query("*", [
                animate(fadeInTiming, style({ opacity: "*" }))
            ], { optional: true }),
        ]),
        // Last, animate children
        query("@constrainWidth, @listCount", [ animateChild() ], { optional: true }),
    ]),
    transition(":leave", [
        style({ height: "*" }),
        query("*", [ style({ opacity: "*" }) ], { optional: true }),
        group([
            query("@constrainWidth, @listCount", [ animateChild() ], { optional: true }),
            animate(transformTiming, style({ height: "0" })),
            query("*", [
                animate(fadeOutTiming, style({ opacity: "0" }))
            ], { optional: true }),
        ]),
    ])
]);
