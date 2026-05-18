// funnels/analytics.js — Provider-agnostic event tracking for the chat funnel.
//
// Public API: window.ChatAnalytics.track(eventName, props)
//
// Behavior:
//   1. Always logs to console (visible in DevTools during dev/QA)
//   2. Always pushes to localStorage circular buffer 'omchat:events' (last 100
//      events) — useful for debugging without server-side aggregation
//   3. If window.posthog is loaded, forwards to posthog.capture()
//   4. If window.gtag is loaded, forwards to gtag('event', ...)
//
// To plug PostHog later: add the official snippet in chat.html <head> before
// this script. Same for GA4 with gtag. No changes needed here.

(function () {
    'use strict';

    const BUFFER_KEY = 'omchat:events';
    const BUFFER_MAX = 100;

    function pushToBuffer(entry) {
        try {
            const raw = localStorage.getItem(BUFFER_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            arr.push(entry);
            if (arr.length > BUFFER_MAX) arr.splice(0, arr.length - BUFFER_MAX);
            localStorage.setItem(BUFFER_KEY, JSON.stringify(arr));
        } catch (e) {
            // localStorage quota/disabled — ignore
        }
    }

    function track(eventName, props) {
        const safeProps = props && typeof props === 'object' ? props : {};
        const entry = {
            event: eventName,
            ts: Date.now(),
            props: safeProps
        };

        console.log('[track]', eventName, safeProps);
        pushToBuffer(entry);

        if (typeof window.posthog !== 'undefined' && typeof window.posthog.capture === 'function') {
            try { window.posthog.capture(eventName, safeProps); } catch (e) {}
        }

        if (typeof window.gtag === 'function') {
            try { window.gtag('event', eventName, safeProps); } catch (e) {}
        }
    }

    function getRecentEvents() {
        try {
            const raw = localStorage.getItem(BUFFER_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function clearEvents() {
        try { localStorage.removeItem(BUFFER_KEY); } catch (e) {}
    }

    window.ChatAnalytics = { track, getRecentEvents, clearEvents };
})();
