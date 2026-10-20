(function initMedikuruMeasurementModule(root, factory) {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  root.MedikuruLineLpMeasurement = api;

  const start = function start() {
    if (api.isAcceptedLandingLocation(root.location)) {
      api.initialize(root, root.document);
    }
  };

  if (root.document.readyState === "loading") {
    root.document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function createMedikuruMeasurement() {
  "use strict";

  const CONFIG = Object.freeze({
    hostname: "line.medikuru.com",
    acceptedPaths: Object.freeze(["/lp", "/lp/"]),
    lineDestinationOrigin: "https://liff.line.me",
    lineDestinationPath: "/2008402152-x8WDy4eX/landing",
    fixedLineParameters: Object.freeze({
      follow: "@658txruh",
      liff_id: "2008402152-x8WDy4eX",
    }),
    lineRoutes: Object.freeze({
      neutral: Object.freeze({
        lp: "HUmT0n",
        insertionScriptSrc: null,
      }),
      meta: Object.freeze({
        lp: "kLgpSK",
        insertionScriptSrc: "https://ltag.jp/lc/kLgpSK",
      }),
      google: Object.freeze({
        lp: "pAt7uM",
        insertionScriptSrc: "https://ltag.jp/lc/pAt7uM",
      }),
      takenouchi_x: Object.freeze({
        lp: "AMqlta",
        insertionScriptSrc: null,
      }),
      takenouchi_line: Object.freeze({
        lp: "Th7yHe",
        insertionScriptSrc: null,
      }),
      ando_x: Object.freeze({
        lp: "FLZlkW",
        insertionScriptSrc: null,
      }),
      form_sales: Object.freeze({
        lp: "nPjRbT",
        // The public LINE URL is verified; do not guess an insertion script URL.
        insertionScriptSrc: null,
      }),
    }),
    lpVersion: "news-ai-search-line-lp-20260927-v1",
    ga4MeasurementId: "G-F7PMRHGDPW",
    googleAdsId: "AW-18091705817",
    metaPixelId: "1251437991384411",
    clarityProjectId: "yh1mbaqpfa",
    maxTrackingParameters: 21,
    maxTrackingValueLength: 256,
  });

  const APPROVED_TRACKING_PARAMETERS = Object.freeze([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "placement_type",
    "adgroup",
    "campaign_id",
    "adset_id",
    "ad_id",
    "campaignid",
    "adgroupid",
    "creative",
    "keyword",
    "matchtype",
    "device",
    "network",
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
  ]);

  const APPROVED_TRACKING_SET = new Set(APPROVED_TRACKING_PARAMETERS);
  const COMMON_TRACKING_SET = new Set([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]);
  // 任意の説明項目は、単一の完全空文字だけを分類から除外する。
  // 媒体名・識別ID・重複・空白や制御文字の拒否条件は変更しない。
  const OPTIONAL_EMPTY_TRACKING_SET = new Set([
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "keyword",
  ]);
  const META_TRACKING_SET = new Set([
    ...COMMON_TRACKING_SET,
    "placement_type",
    "adgroup",
    "campaign_id",
    "adset_id",
    "ad_id",
    "fbclid",
  ]);
  const GOOGLE_TRACKING_SET = new Set([
    ...COMMON_TRACKING_SET,
    "campaignid",
    "adgroupid",
    "creative",
    "keyword",
    "matchtype",
    "device",
    "network",
    "gclid",
    "gbraid",
    "wbraid",
  ]);
  const META_SPECIFIC_TRACKING_SET = new Set([
    "placement_type",
    "adgroup",
    "campaign_id",
    "adset_id",
    "ad_id",
    "fbclid",
  ]);
  const GOOGLE_SPECIFIC_TRACKING_SET = new Set([
    "campaignid",
    "adgroupid",
    "creative",
    "keyword",
    "matchtype",
    "device",
    "network",
    "gclid",
    "gbraid",
    "wbraid",
  ]);
  const GOOGLE_CLICK_ID_KEYS = Object.freeze(["gclid", "gbraid", "wbraid"]);
  const GOOGLE_SOURCE_VALUES = new Set(["google", "google_ads"]);
  const NO_WHITESPACE_TRACKING_SET = new Set([
    "utm_source",
    "placement_type",
    "campaign_id",
    "adset_id",
    "ad_id",
    "fbclid",
    "campaignid",
    "adgroupid",
    "creative",
    "matchtype",
    "device",
    "network",
    "gclid",
    "gbraid",
    "wbraid",
  ]);
  const META_SOURCE_VALUES = new Set([
    "fb",
    "facebook",
    "ig",
    "instagram",
    "msg",
    "messenger",
    "an",
    "audience_network",
    "meta",
  ]);
  const UNSAFE_CONTROL_OR_FORMAT_CHARACTER_PATTERN = /[\p{Cc}\p{Cf}]/u;
  const ASCII_VISIBLE_IDENTIFIER_PATTERN = /^[\x21-\x7e]+$/u;
  const CTA_SELECTOR = "a[data-medikuru-line-cta]";
  const EVENT_ATTRIBUTION_PARAMETERS = Object.freeze([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "placement_type",
    "adgroup",
    "campaign_id",
    "adset_id",
    "ad_id",
    "campaignid",
    "adgroupid",
    "creative",
    "keyword",
    "matchtype",
    "device",
    "network",
    "lp_version",
  ]);

  function asUrl(value, base) {
    try {
      return new URL(value, base);
    } catch (_error) {
      return null;
    }
  }

  function isAcceptedLandingLocation(locationLike) {
    if (!locationLike) return false;
    const url = asUrl(locationLike.href || String(locationLike));
    return Boolean(
      url
      && url.origin === `https://${CONFIG.hostname}`
      && !url.username
      && !url.password
      && CONFIG.acceptedPaths.includes(url.pathname)
    );
  }

  function collectTrackingOccurrences(sourceUrl) {
    const occurrences = new Map();
    for (const [key, value] of sourceUrl.searchParams.entries()) {
      if (!APPROVED_TRACKING_SET.has(key)) continue;
      const values = occurrences.get(key) || [];
      values.push(value);
      occurrences.set(key, values);
    }
    return occurrences;
  }

  function isValidTrackingValue(key, value) {
    const trimmedValue = value.trim();
    return Boolean(
      trimmedValue
      && trimmedValue === value
      && value.length <= CONFIG.maxTrackingValueLength
      && !UNSAFE_CONTROL_OR_FORMAT_CHARACTER_PATTERN.test(value)
      && (!NO_WHITESPACE_TRACKING_SET.has(key) || ASCII_VISIBLE_IDENTIFIER_PATTERN.test(value))
    );
  }

  function collectTrackingParameters(sourceUrlLike, routeName) {
    const sourceUrl = asUrl(sourceUrlLike);
    if (!sourceUrl) return Object.freeze({ lp_version: CONFIG.lpVersion });

    const allowedTrackingSet = routeName === "meta"
      ? META_TRACKING_SET
      : routeName === "google"
        ? GOOGLE_TRACKING_SET
        : ["neutral", "form_sales", "takenouchi_x", "takenouchi_line", "ando_x"].includes(routeName)
          ? COMMON_TRACKING_SET
          : APPROVED_TRACKING_SET;

    const occurrences = collectTrackingOccurrences(sourceUrl);

    const accepted = {};
    let acceptedCount = 0;
    for (const key of APPROVED_TRACKING_PARAMETERS) {
      if (acceptedCount >= CONFIG.maxTrackingParameters) break;
      if (!allowedTrackingSet.has(key)) continue;
      const values = occurrences.get(key);
      if (!values || values.length !== 1) continue;
      const value = values[0];
      if (!isValidTrackingValue(key, value)) continue;
      accepted[key] = value;
      acceptedCount += 1;
    }

    accepted.lp_version = CONFIG.lpVersion;
    return Object.freeze(accepted);
  }

  function classifyTrafficSource(sourceUrlLike) {
    const sourceUrl = asUrl(sourceUrlLike);
    if (!sourceUrl) return "neutral";

    const occurrences = collectTrackingOccurrences(sourceUrl);
    for (const [key, values] of occurrences.entries()) {
      if (values.length !== 1) return "neutral";
      if (OPTIONAL_EMPTY_TRACKING_SET.has(key) && values[0] === "") {
        occurrences.delete(key);
        continue;
      }
      if (!isValidTrackingValue(key, values[0])) return "neutral";
    }

    const valueFor = function valueFor(key) {
      const values = occurrences.get(key);
      return values ? values[0] : "";
    };
    const source = valueFor("utm_source").toLowerCase();
    const hasGoogleSource = GOOGLE_SOURCE_VALUES.has(source);
    const hasMetaSource = META_SOURCE_VALUES.has(source);
    const hasUnknownSource = Boolean(source && !hasGoogleSource && !hasMetaSource);
    const googleClickIdCount = GOOGLE_CLICK_ID_KEYS
      .filter((key) => occurrences.has(key))
      .length;
    const hasMetaSpecificSignal = Array.from(META_SPECIFIC_TRACKING_SET)
      .some((key) => occurrences.has(key));
    const hasGoogleSpecificSignal = Array.from(GOOGLE_SPECIFIC_TRACKING_SET)
      .some((key) => occurrences.has(key));
    const hasCompleteMetaIds = Boolean(
      occurrences.has("campaign_id")
      && occurrences.has("adset_id")
      && occurrences.has("ad_id")
    );
    const hasAnyMetaSignal = Boolean(hasMetaSource || hasMetaSpecificSignal);
    const hasAnyGoogleSignal = Boolean(hasGoogleSource || hasGoogleSpecificSignal);

    if (
      (source === "takenouchi_x" || source === "takenouchi_line" || source === "ando_x")
      && valueFor("utm_medium") === "referral"
      && !hasAnyMetaSignal
      && !hasAnyGoogleSignal
    ) return source;

    if (
      source === "form_sales"
      && valueFor("utm_medium") === "contact_form"
      && !hasAnyMetaSignal
      && !hasAnyGoogleSignal
    ) return "form_sales";

    if (
      googleClickIdCount === 1
      && !hasAnyMetaSignal
      && !hasUnknownSource
      && (!source || hasGoogleSource)
    ) return "google";
    if (hasMetaSource && hasCompleteMetaIds && !hasAnyGoogleSignal) return "meta";
    return "neutral";
  }

  function buildAttributionEventParameters(sourceUrlLike) {
    const routeName = classifyTrafficSource(sourceUrlLike);
    const trackingParameters = collectTrackingParameters(sourceUrlLike, routeName);
    const eventParameters = { traffic_route: routeName };
    for (const key of EVENT_ATTRIBUTION_PARAMETERS) {
      if (Object.prototype.hasOwnProperty.call(trackingParameters, key)) {
        eventParameters[key] = trackingParameters[key];
      }
    }
    return Object.freeze(eventParameters);
  }

  function buildBaseLineDestination(routeName) {
    const route = CONFIG.lineRoutes[routeName];
    if (!route) throw new Error("LINE_ROUTE_UNKNOWN");
    const destinationUrl = new URL(CONFIG.lineDestinationPath, CONFIG.lineDestinationOrigin);
    for (const [key, value] of Object.entries(CONFIG.fixedLineParameters)) {
      destinationUrl.searchParams.set(key, value);
    }
    destinationUrl.searchParams.set("lp", route.lp);
    return destinationUrl;
  }

  function assertFixedLineDestination(destinationUrl, routeName) {
    if (
      destinationUrl.protocol !== "https:"
      || destinationUrl.origin !== CONFIG.lineDestinationOrigin
      || destinationUrl.pathname !== CONFIG.lineDestinationPath
      || destinationUrl.username
      || destinationUrl.password
      || destinationUrl.hash
    ) {
      throw new Error("LINE_DESTINATION_MISMATCH");
    }

    const route = CONFIG.lineRoutes[routeName];
    if (!route) throw new Error("LINE_ROUTE_UNKNOWN");
    const allowedBaseKeys = new Set([...Object.keys(CONFIG.fixedLineParameters), "lp"]);
    for (const key of destinationUrl.searchParams.keys()) {
      if (!allowedBaseKeys.has(key)) throw new Error("LINE_DESTINATION_QUERY_MISMATCH");
    }

    for (const [key, expectedValue] of Object.entries(CONFIG.fixedLineParameters)) {
      const values = destinationUrl.searchParams.getAll(key);
      if (values.length !== 1 || values[0] !== expectedValue) {
        throw new Error("LINE_DESTINATION_FIXED_PARAMETER_MISMATCH");
      }
    }
    const routeValues = destinationUrl.searchParams.getAll("lp");
    if (routeValues.length !== 1 || routeValues[0] !== route.lp) {
      throw new Error("LINE_DESTINATION_ROUTE_MISMATCH");
    }
  }

  function buildTrackedLineDestination(sourceUrlLike) {
    const selectedRouteName = classifyTrafficSource(sourceUrlLike);
    const destinationUrl = buildBaseLineDestination(selectedRouteName);
    assertFixedLineDestination(destinationUrl, selectedRouteName);

    const trackingParameters = collectTrackingParameters(sourceUrlLike, selectedRouteName);
    for (const [key, value] of Object.entries(trackingParameters)) {
      destinationUrl.searchParams.set(key, value);
    }
    return destinationUrl.toString();
  }

  function initializeLstepRoute(documentLike, routeName) {
    const route = CONFIG.lineRoutes[routeName];
    if (!route) throw new Error("LINE_ROUTE_UNKNOWN");
    if (!route.insertionScriptSrc) return false;
    injectScript(
      documentLike,
      "medikuru-lstep-ad-route",
      route.insertionScriptSrc,
    );
    return true;
  }

  function injectScript(documentLike, id, src) {
    if (documentLike.getElementById(id)) return;
    const script = documentLike.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    documentLike.head.appendChild(script);
  }

  function initializeGoogle(windowLike, documentLike) {
    windowLike.dataLayer = windowLike.dataLayer || [];
    windowLike.gtag = windowLike.gtag || function gtag() {
      windowLike.dataLayer.push(arguments);
    };
    windowLike.gtag("js", new Date());
    windowLike.gtag("config", CONFIG.ga4MeasurementId, {
      anonymize_ip: true,
      send_page_view: true,
    });
    windowLike.gtag("config", CONFIG.googleAdsId, {
      send_page_view: false,
    });
    injectScript(
      documentLike,
      "medikuru-google-tag",
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.ga4MeasurementId)}`,
    );
  }

  function initializeMeta(windowLike, documentLike) {
    if (!windowLike.fbq) {
      const queue = function fbq() {
        if (queue.callMethod) queue.callMethod.apply(queue, arguments);
        else queue.queue.push(arguments);
      };
      queue.push = queue;
      queue.loaded = true;
      queue.version = "2.0";
      queue.queue = [];
      windowLike.fbq = queue;
      if (!windowLike._fbq) windowLike._fbq = queue;
    }
    windowLike.fbq("init", CONFIG.metaPixelId);
    windowLike.fbq("trackSingle", CONFIG.metaPixelId, "PageView");
    injectScript(documentLike, "medikuru-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
  }

  function initializeClarity(windowLike, documentLike) {
    windowLike.clarity = windowLike.clarity || function clarity() {
      (windowLike.clarity.q = windowLike.clarity.q || []).push(arguments);
    };
    injectScript(
      documentLike,
      "medikuru-clarity",
      `https://www.clarity.ms/tag/${encodeURIComponent(CONFIG.clarityProjectId)}`,
    );
  }

  function recordLandingPageView(windowLike, sourceUrlLike) {
    const eventParameters = buildAttributionEventParameters(sourceUrlLike);
    if (typeof windowLike.gtag === "function") {
      try {
        windowLike.gtag("event", "medikuru_lp_view", eventParameters);
      } catch (_error) {
        // 計測失敗でLP表示を妨げない。
      }
    }
    if (typeof windowLike.fbq === "function") {
      try {
        windowLike.fbq(
          "trackSingleCustom",
          CONFIG.metaPixelId,
          "MedikuruLpView",
          eventParameters,
        );
      } catch (_error) {
        // 計測失敗でLP表示を妨げない。
      }
    }
    if (typeof windowLike.clarity === "function") {
      try {
        for (const key of ["traffic_route", "utm_campaign", "utm_content", "ad_id", "lp_version"]) {
          if (eventParameters[key]) windowLike.clarity("set", key, eventParameters[key]);
        }
        windowLike.clarity("event", "medikuru_lp_view");
      } catch (_error) {
        // 計測失敗でLP表示を妨げない。
      }
    }
  }

  function recordDiagnosticClick(windowLike, ctaName, routeName, sourceUrlLike) {
    const eventParameters = {
      cta_name: ctaName,
      ...(sourceUrlLike
        ? buildAttributionEventParameters(sourceUrlLike)
        : { lp_version: CONFIG.lpVersion, traffic_route: routeName }),
    };
    if (typeof windowLike.gtag === "function") {
      try {
        windowLike.gtag("event", "line_cta_click", eventParameters);
      } catch (_error) {
        // 計測失敗でLINEへの通常遷移を妨げない。
      }
    }
    if (typeof windowLike.fbq === "function") {
      try {
        windowLike.fbq("trackSingleCustom", CONFIG.metaPixelId, "LineCtaClick", eventParameters);
      } catch (_error) {
        // 計測失敗でLINEへの通常遷移を妨げない。
      }
    }
    if (typeof windowLike.clarity === "function") {
      try {
        windowLike.clarity("event", `line_cta_click_${ctaName}`);
      } catch (_error) {
        // 計測失敗でLINEへの通常遷移を妨げない。
      }
    }
  }

  function prepareLineCtas(windowLike, documentLike) {
    const links = Array.from(documentLike.querySelectorAll(CTA_SELECTOR));
    // The closing CTA is optional after the approved footer cleanup. Keep the
    // two core CTAs mandatory without disabling all measurement when it is absent.
    const requiredCtaNames = ["hero", "section-1"];
    const expectedCtaNames = [...requiredCtaNames, "section-4"];
    if (links.length < requiredCtaNames.length || links.length > expectedCtaNames.length) {
      throw new Error("LINE_CTA_COUNT_MISMATCH");
    }

    const names = new Set();
    const preparedLinks = [];
    const routeName = classifyTrafficSource(windowLike.location.href);
    const trackedHref = buildTrackedLineDestination(windowLike.location.href);
    for (const link of links) {
      const ctaName = link.getAttribute("data-medikuru-line-cta");
      if (!expectedCtaNames.includes(ctaName) || names.has(ctaName)) throw new Error("LINE_CTA_NAME_MISMATCH");
      names.add(ctaName);
      preparedLinks.push({
        link,
        ctaName,
        originalHref: link.getAttribute("href"),
        trackedHref,
      });
    }

    if (requiredCtaNames.some((name) => !names.has(name))) throw new Error("LINE_CTA_NAME_MISMATCH");

    try {
      for (const prepared of preparedLinks) {
        prepared.link.href = prepared.trackedHref;
      }
    } catch (error) {
      for (const prepared of preparedLinks) {
        prepared.link.setAttribute("href", prepared.originalHref);
      }
      throw error;
    }

    for (const prepared of preparedLinks) {
      prepared.link.addEventListener("click", function onLineCtaClick() {
        recordDiagnosticClick(
          windowLike,
          prepared.ctaName,
          routeName,
          windowLike.location.href,
        );
      });
    }

    return Object.freeze({
      ctaCount: links.length,
      routeName,
    });
  }

  function initialize(windowLike, documentLike) {
    if (!isAcceptedLandingLocation(windowLike.location)) {
      throw new Error("LANDING_LOCATION_MISMATCH");
    }
    if (windowLike.__medikuruLineLpMeasurementInitialized === true) return false;

    const ctaPreparation = prepareLineCtas(windowLike, documentLike);
    // The LP's absolute <base> otherwise drops referral parameters on hash links.
    if (["takenouchi_x", "takenouchi_line", "ando_x"].includes(ctaPreparation.routeName)) {
      for (const link of Array.from(documentLike.querySelectorAll('a[href^="#"]'))) {
        const destination = new URL(windowLike.location.href);
        destination.hash = link.getAttribute("href");
        link.setAttribute("href", destination.toString());
      }
    }

    const analyticsFailures = [];
    try {
      initializeLstepRoute(documentLike, ctaPreparation.routeName);
    } catch (_error) {
      analyticsFailures.push("lstep_route");
    }
    for (const [name, initializer] of [
      ["google", initializeGoogle],
      ["meta", initializeMeta],
      ["clarity", initializeClarity],
    ]) {
      try {
        initializer(windowLike, documentLike);
      } catch (_error) {
        analyticsFailures.push(name);
      }
    }
    recordLandingPageView(windowLike, windowLike.location.href);
    windowLike.__medikuruLineLpMeasurementStatus = Object.freeze({
      ctaCount: ctaPreparation.ctaCount,
      routeName: ctaPreparation.routeName,
      analyticsFailures: Object.freeze(analyticsFailures),
    });
    windowLike.__medikuruLineLpMeasurementInitialized = true;
    return true;
  }

  return Object.freeze({
    CONFIG,
    APPROVED_TRACKING_PARAMETERS,
    CTA_SELECTOR,
    isAcceptedLandingLocation,
    collectTrackingParameters,
    classifyTrafficSource,
    buildAttributionEventParameters,
    buildBaseLineDestination,
    buildTrackedLineDestination,
    initializeLstepRoute,
    prepareLineCtas,
    recordLandingPageView,
    recordDiagnosticClick,
    initialize,
  });
}));
