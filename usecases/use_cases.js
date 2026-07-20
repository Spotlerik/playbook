// Mirror of use_cases.json, loaded as a <script> so the app runs on file:// and static hosts without fetch/CORS.
window.USE_CASES = {
  "meta": {
    "title": "The Use Case Menu",
    "product": "Spotler Activate",
    "proposition": "Spotler Activate turns anonymous traffic into known, profiled, monetised customer relationships.",
    "count": 18,
    "disclaimer": "All figures are illustrative benchmarks for positioning, never a customer guarantee. Always validate against the prospect’s own baseline."
  },
  "brand": {
    "navy": "#002a4d",
    "navy_shade": "#001d34",
    "navy_tint": "#ccdde3",
    "cyan": "#23afe6",
    "cyan_shade": "#1d93c1",
    "cyan_tint": "#e6f6fc",
    "yellow": "#f0e306",
    "green": "#5cd975",
    "green_shade": "#429b54",
    "orange": "#fb7c1c",
    "orange_shade": "#bc5d15",
    "violet": "#7c5cfc",
    "earn": "#429b54",
    "save": "#1d93c1",
    "canvas": "#eef2f6",
    "card": "#ffffff",
    "line": "#e4eaf0",
    "ink": "#1f2d3a",
    "muted": "#6b7a89",
    "font_heading": "Open Sans (700/800) — substitute for Greycliff CF Heavy",
    "font_body": "Open Sans (400/600)"
  },
  "industries": [
    {
      "id": "commerce",
      "label": "Commerce",
      "sublabel": "E-commerce & retail"
    },
    {
      "id": "travel",
      "label": "Travel",
      "sublabel": "Trips & accommodation"
    },
    {
      "id": "culture",
      "label": "Culture",
      "sublabel": "Theatre, music & events"
    }
  ],
  "lifecycle_stages": [
    "Anonymous visitor",
    "Known visitor",
    "Customer",
    "Loyal customer"
  ],
  "connections": [
    "website tag",
    "product feed",
    "email",
    "backend data",
    "Google and Meta",
    "order history"
  ],
  "courses": [
    {
      "id": "capture",
      "no": "01",
      "name": "Capture",
      "tagline": "Capture more first-party data",
      "line": "Turn anonymous traffic into known, profiled contacts you actually own.",
      "color": "#23afe6"
    },
    {
      "id": "convert",
      "no": "02",
      "name": "Convert",
      "tagline": "Convert more visitors",
      "line": "Make every visit relevant, timely and persuasive, so more browsers buy.",
      "color": "#7c5cfc"
    },
    {
      "id": "recover",
      "no": "03",
      "name": "Recover",
      "tagline": "Recover lost revenue",
      "line": "Win back the carts, bookings and browsers that would otherwise slip away.",
      "color": "#fb7c1c"
    },
    {
      "id": "grow",
      "no": "04",
      "name": "Grow",
      "tagline": "Increase repeat engagement",
      "line": "Turn a first purchase into a second, a third, and a high-value lifetime.",
      "color": "#002a4d"
    }
  ],
  "challenges": [
    {
      "id": "acquisition",
      "name": "Acquisition",
      "icon": "person-plus",
      "line": "Too few or too expensive new customers.",
      "subs": [
        {
          "id": "acq-expensive",
          "short": "Acquisition too expensive",
          "label": "Acquisition is getting too expensive",
          "sounds_like": "Rising ad costs and too much reliance on paid channels.",
          "use_case_ids": [
            "email-capture",
            "rt-segmentation",
            "online-retargeting"
          ]
        },
        {
          "id": "acq-data",
          "short": "Too little first-party data",
          "label": "Too little first-party data",
          "sounds_like": "Not enough owned data to target and personalise well.",
          "use_case_ids": [
            "email-capture",
            "profile-enrichment",
            "email-recognition"
          ]
        },
        {
          "id": "acq-audience",
          "short": "Not reaching right audience",
          "label": "Not reaching the right audience",
          "sounds_like": "Campaigns are too generic to land with the right people.",
          "use_case_ids": [
            "profile-enrichment",
            "rt-segmentation",
            "online-retargeting"
          ]
        }
      ]
    },
    {
      "id": "growth",
      "name": "Growth",
      "icon": "trending-up",
      "line": "Too little value from existing visitors and customers.",
      "subs": [
        {
          "id": "grow-relevance",
          "short": "Site not relevant enough",
          "label": "The site is not relevant enough per visitor",
          "sounds_like": "Most visitors see much the same thing, whoever they are.",
          "use_case_ids": [
            "pers-homepage",
            "rec-onsite",
            "persuasive-product"
          ]
        },
        {
          "id": "grow-conversion",
          "short": "Low conversion",
          "label": "Low conversion",
          "sounds_like": "Plenty of visitors browse, but too few of them buy.",
          "use_case_ids": [
            "persuasive-popups",
            "abandoned-cart",
            "browse-abandonment",
            "persuasive-product"
          ]
        },
        {
          "id": "grow-ordervalue",
          "short": "Low order value",
          "label": "Low order value",
          "sounds_like": "No cross-sell or upsell to lift the average basket.",
          "use_case_ids": [
            "rec-onsite",
            "rec-email",
            "rec-matching",
            "rec-crosssell"
          ]
        }
      ]
    },
    {
      "id": "retention",
      "name": "Retention",
      "icon": "repeat",
      "line": "Losing customers, or not bringing them back.",
      "subs": [
        {
          "id": "ret-return",
          "short": "Customers do not return",
          "label": "Customers do not return",
          "sounds_like": "A first purchase rarely turns into a second one.",
          "use_case_ids": [
            "followup-loyalty",
            "rec-crosssell",
            "back-in-stock",
            "predictive-clv"
          ]
        },
        {
          "id": "ret-recognised",
          "short": "Visitors not recognised",
          "label": "Returning visitors are not recognised",
          "sounds_like": "Known customers are treated like first-time strangers.",
          "use_case_ids": [
            "email-recognition",
            "pers-homepage",
            "website-reminder"
          ]
        }
      ]
    }
  ],
  "use_cases": [
    {
      "id": "email-capture",
      "number": 1,
      "name": "Grow your email list",
      "hook": "Stop letting buyers leave as strangers.",
      "course": "capture",
      "capability": "Email capture",
      "capability_group": "Data capture and enrichment",
      "lifecycle": "Anonymous visitor",
      "lifecycle_note": "recognise and capture",
      "setup": "core",
      "type": "earn",
      "blurb": "Turn anonymous visitors into known contacts",
      "problem": "Most visitors leave without ever telling you who they are, so you can never follow up.",
      "how": "Activate invites people to sign up at the right moment, then starts a profile from their very first click.",
      "rivals": "Standalone pop-up tools grab an email but leave it cut off from the rest of your data.",
      "needs": [
        "website tag"
      ],
      "solves": [
        {
          "challenge": "acquisition",
          "sub_id": "acq-expensive",
          "label": "Acquisition too expensive"
        },
        {
          "challenge": "acquisition",
          "sub_id": "acq-data",
          "label": "Too little first-party data"
        }
      ],
      "demo_screen": "Sign-up pop-up capturing a first-time visitor — customer-facing webshop view",
      "metrics": {
        "commerce": {
          "value": "+27%",
          "label": "more known contacts",
          "context": "to market to"
        },
        "travel": {
          "value": "+27%",
          "label": "more known contacts",
          "context": "to market to"
        },
        "culture": {
          "value": "+27%",
          "label": "more known contacts",
          "context": "to market to"
        }
      },
      "examples": {
        "commerce": "A first-time shopper browsing trainers sees a gentle sign-up offer and joins your list before they bounce.",
        "travel": "Someone comparing city breaks leaves their email for price alerts before they leave the site.",
        "culture": "A first-time visitor checking opening times signs up for news and offers in one tap."
      }
    },
    {
      "id": "profile-enrichment",
      "number": 2,
      "name": "Build richer customer profiles",
      "hook": "Know what they want before they tell you.",
      "course": "capture",
      "capability": "Profile enrichment",
      "capability_group": "Data capture and enrichment",
      "lifecycle": "Anonymous visitor",
      "lifecycle_note": "recognise and capture",
      "setup": "core",
      "type": "save",
      "blurb": "Add live interests and behaviour to every profile",
      "problem": "A name and an email tell you very little about what someone actually wants.",
      "how": "Activate adds behaviour, preferences and purchase history to every profile as people interact.",
      "rivals": null,
      "needs": [
        "website tag"
      ],
      "solves": [
        {
          "challenge": "acquisition",
          "sub_id": "acq-data",
          "label": "Too little first-party data"
        },
        {
          "challenge": "acquisition",
          "sub_id": "acq-audience",
          "label": "Not reaching right audience"
        }
      ],
      "demo_screen": "360° customer profile in Spotler Activate — enriched behaviour, interests and CLV",
      "metrics": {
        "commerce": {
          "value": "17%",
          "label": "less wasted spend",
          "context": "from richer profiles"
        },
        "travel": {
          "value": "17%",
          "label": "less wasted spend",
          "context": "from richer profiles"
        },
        "culture": {
          "value": "17%",
          "label": "less wasted spend",
          "context": "from richer profiles"
        }
      },
      "examples": {
        "commerce": "A shopper who keeps viewing running gear is quietly tagged as a runner, ready for relevant offers.",
        "travel": "A browser who keeps returning to beach trips is enriched with a clear holiday preference.",
        "culture": "A member who books family events is enriched so you can lead with family programming."
      }
    },
    {
      "id": "rt-segmentation",
      "number": 3,
      "name": "Segment visitors in real time",
      "hook": "Yesterday's segments are already wrong.",
      "course": "capture",
      "capability": "Real-time segmentation and audiences",
      "capability_group": "Segmentation and audiences",
      "lifecycle": "Anonymous visitor",
      "lifecycle_note": "recognise and capture",
      "setup": "core",
      "type": "save",
      "blurb": "Group visitors by what they do, as they do it",
      "problem": "Static lists are out of date the moment they are built, so spend goes to the wrong people.",
      "how": "Activate builds live audiences that update the instant someone behaves differently.",
      "rivals": "Batch tools rebuild segments overnight, so you are always acting on yesterday.",
      "needs": [
        "website tag",
        "backend data"
      ],
      "solves": [
        {
          "challenge": "acquisition",
          "sub_id": "acq-expensive",
          "label": "Acquisition too expensive"
        },
        {
          "challenge": "acquisition",
          "sub_id": "acq-audience",
          "label": "Not reaching right audience"
        }
      ],
      "demo_screen": "Real-time segment builder with live visitor filters in Spotler Activate",
      "metrics": {
        "commerce": {
          "value": "20%",
          "label": "less wasted spend",
          "context": "with real-time audiences"
        },
        "travel": {
          "value": "20%",
          "label": "less wasted spend",
          "context": "with real-time audiences"
        },
        "culture": {
          "value": "20%",
          "label": "less wasted spend",
          "context": "with real-time audiences"
        }
      },
      "examples": {
        "commerce": "A \"high intent, not yet bought\" audience updates in real time as people browse and buy.",
        "travel": "A \"searching but not booked\" audience refreshes live as trips are viewed and reserved.",
        "culture": "A \"browsing but not booked\" audience keeps itself current as tickets are viewed."
      }
    },
    {
      "id": "email-recognition",
      "number": 4,
      "name": "Recognise returning visitors",
      "hook": "Never greet a loyal customer like a stranger.",
      "course": "capture",
      "capability": "Email recognition",
      "capability_group": "Customer recognition",
      "lifecycle": "Anonymous visitor",
      "lifecycle_note": "recognise and capture",
      "setup": "addon",
      "type": "earn",
      "blurb": "Greet known customers, even before they log in",
      "problem": "Returning customers are treated like total strangers every time they visit.",
      "how": "Activate recognises known contacts by email across visits and devices, and joins up their history.",
      "rivals": null,
      "needs": [
        "website tag"
      ],
      "solves": [
        {
          "challenge": "acquisition",
          "sub_id": "acq-data",
          "label": "Too little first-party data"
        },
        {
          "challenge": "retention",
          "sub_id": "ret-recognised",
          "label": "Visitors not recognised"
        }
      ],
      "demo_screen": "Returning visitor greeted by name on the homepage — customer-facing view",
      "metrics": {
        "commerce": {
          "value": "+14%",
          "label": "more revenue",
          "context": "from recognised visitors"
        },
        "travel": {
          "value": "+14%",
          "label": "more revenue",
          "context": "from recognised visitors"
        },
        "culture": {
          "value": "+14%",
          "label": "more revenue",
          "context": "from recognised visitors"
        }
      },
      "examples": {
        "commerce": "A loyal customer is recognised on arrival, so the site greets them with what they care about.",
        "travel": "A repeat traveller is recognised and shown trips that match their last few searches.",
        "culture": "A returning member is recognised and shown what is new since their last visit."
      }
    },
    {
      "id": "website-reminder",
      "number": 5,
      "name": "Remind visitors where they left off",
      "hook": "Pick up exactly where they left off.",
      "course": "convert",
      "capability": "Website reminder",
      "capability_group": "On-site personalisation and persuasion",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "core",
      "type": "earn",
      "blurb": "Pick up the journey on the next visit",
      "problem": "Visitors forget what caught their eye between one visit and the next.",
      "how": "Activate quietly reminds returning visitors of what they were last looking at.",
      "rivals": null,
      "needs": [
        "website tag"
      ],
      "solves": [
        {
          "challenge": "retention",
          "sub_id": "ret-recognised",
          "label": "Visitors not recognised"
        }
      ],
      "demo_screen": "\"Continue where you left off\" on-site banner with last-viewed item",
      "metrics": {
        "commerce": {
          "value": "+8%",
          "label": "more returning visitors",
          "context": "from website reminders"
        },
        "travel": {
          "value": "+8%",
          "label": "more returning visitors",
          "context": "from website reminders"
        },
        "culture": {
          "value": "+8%",
          "label": "more returning visitors",
          "context": "from website reminders"
        }
      },
      "examples": {
        "commerce": "A returning shopper sees a \"still interested?\" strip with the products they viewed last time.",
        "travel": "A returning traveller sees the trips they were comparing, ready to pick up where they left off.",
        "culture": "A returning visitor sees the events they viewed, with dates still available."
      }
    },
    {
      "id": "pers-homepage",
      "number": 6,
      "name": "Personalise the homepage",
      "hook": "One homepage. Every visitor. Theirs.",
      "course": "convert",
      "capability": "Personalised homepage or banner",
      "capability_group": "On-site personalisation and persuasion",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "core",
      "type": "earn",
      "blurb": "A different homepage for every visitor",
      "problem": "Everyone lands on the same homepage, however different they are.",
      "how": "Activate tailors the homepage and banners to each visitor in real time.",
      "rivals": null,
      "needs": [
        "website tag"
      ],
      "solves": [
        {
          "challenge": "growth",
          "sub_id": "grow-relevance",
          "label": "Site not relevant enough"
        },
        {
          "challenge": "retention",
          "sub_id": "ret-recognised",
          "label": "Visitors not recognised"
        }
      ],
      "demo_screen": "Segment-specific hero banner adapting to visitor type — customer-facing homepage",
      "metrics": {
        "commerce": {
          "value": "+13%",
          "label": "higher conversion",
          "context": "from a personalised homepage"
        },
        "travel": {
          "value": "+13%",
          "label": "higher conversion",
          "context": "from a personalised homepage"
        },
        "culture": {
          "value": "+13%",
          "label": "higher conversion",
          "context": "from a personalised homepage"
        }
      },
      "examples": {
        "commerce": "A returning shopper lands on their favourite category, not a generic hero banner.",
        "travel": "A returning traveller lands on the destinations they keep coming back to.",
        "culture": "A returning member lands on the kind of events they actually attend."
      }
    },
    {
      "id": "rec-onsite",
      "number": 7,
      "name": "Recommend products on your site",
      "hook": "Put what they'll buy right in front of them.",
      "course": "convert",
      "capability": "On-site product recommendations",
      "capability_group": "Recommendations",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "addon",
      "type": "earn",
      "blurb": "Show every visitor what they are most likely to buy",
      "problem": "Visitors have to dig for products they would happily buy.",
      "how": "Activate shows on-site recommendations tuned to each visitor and what they are viewing now.",
      "rivals": null,
      "needs": [
        "product feed"
      ],
      "solves": [
        {
          "challenge": "growth",
          "sub_id": "grow-relevance",
          "label": "Site not relevant enough"
        },
        {
          "challenge": "growth",
          "sub_id": "grow-ordervalue",
          "label": "Low order value"
        }
      ],
      "demo_screen": "Personalised product recommendation carousel on a category or product page",
      "metrics": {
        "commerce": {
          "value": "+11%",
          "label": "higher conversion",
          "context": "from on-site recommendations"
        },
        "travel": {
          "value": "+11%",
          "label": "higher conversion",
          "context": "from on-site recommendations"
        },
        "culture": {
          "value": "+11%",
          "label": "higher conversion",
          "context": "from on-site recommendations"
        }
      },
      "examples": {
        "commerce": "A shopper viewing a jacket sees matching items and popular pairings right on the page.",
        "travel": "A traveller viewing a hotel sees nearby experiences and add-ons worth booking.",
        "culture": "A visitor viewing an exhibition sees related events they can add to their trip."
      }
    },
    {
      "id": "rec-matching",
      "number": 8,
      "name": "Recommend similar products",
      "hook": "When the first choice misses, show the next.",
      "course": "convert",
      "capability": "Matching-attribute recommendations",
      "capability_group": "Recommendations",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "addon",
      "type": "earn",
      "blurb": "Point shoppers to items like the ones they view",
      "problem": "You know a product is popular, but not what pairs well with it.",
      "how": "Activate recommends by shared attributes, so suggestions feel hand-picked.",
      "rivals": null,
      "needs": [
        "product feed"
      ],
      "solves": [
        {
          "challenge": "growth",
          "sub_id": "grow-ordervalue",
          "label": "Low order value"
        }
      ],
      "demo_screen": "\"You might also like\" similar-products grid on a PDP — customer-facing view",
      "metrics": {
        "commerce": {
          "value": "+10%",
          "label": "higher conversion",
          "context": "from matching recommendations"
        },
        "travel": {
          "value": "+10%",
          "label": "higher conversion",
          "context": "from matching recommendations"
        },
        "culture": {
          "value": "+10%",
          "label": "higher conversion",
          "context": "from matching recommendations"
        }
      },
      "examples": {
        "commerce": "A shopper viewing a navy coat sees items that match on style, colour and season.",
        "travel": "A traveller viewing a ski trip sees breaks that match on season and activity.",
        "culture": "A visitor viewing a jazz night sees events that match on genre and mood."
      }
    },
    {
      "id": "persuasive-product",
      "number": 9,
      "name": "Add social proof to product pages",
      "hook": "Give them a reason to buy now.",
      "course": "convert",
      "capability": "Persuasive product info",
      "capability_group": "On-site personalisation and persuasion",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "core",
      "type": "earn",
      "blurb": "Show popularity and scarcity where it counts",
      "problem": "Product pages give people no reason to act now.",
      "how": "Activate adds live stock, urgency and social proof to product pages.",
      "rivals": null,
      "needs": [
        "website tag",
        "product feed"
      ],
      "solves": [
        {
          "challenge": "growth",
          "sub_id": "grow-relevance",
          "label": "Site not relevant enough"
        },
        {
          "challenge": "growth",
          "sub_id": "grow-conversion",
          "label": "Low conversion"
        }
      ],
      "demo_screen": "Product page with live social proof: view count, low stock, recent purchases",
      "metrics": {
        "commerce": {
          "value": "+12%",
          "label": "higher conversion",
          "context": "from persuasive product info"
        },
        "travel": {
          "value": "+12%",
          "label": "higher conversion",
          "context": "from persuasive product info"
        },
        "culture": {
          "value": "+12%",
          "label": "higher conversion",
          "context": "from persuasive product info"
        }
      },
      "examples": {
        "commerce": "A product page shows \"only three left\" and how many bought it this week.",
        "travel": "A trip page shows how many people are viewing it and how few places remain.",
        "culture": "An event page shows seats selling and how popular it is right now."
      }
    },
    {
      "id": "persuasive-popups",
      "number": 10,
      "name": "Persuade with timely pop-ups",
      "hook": "The right nudge at the exact right second.",
      "course": "convert",
      "capability": "Persuasive pop-ups and overlays",
      "capability_group": "On-site personalisation and persuasion",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "core",
      "type": "earn",
      "blurb": "Well-timed nudges that help visitors decide",
      "problem": "Visitors hesitate at the very moment they could convert.",
      "how": "Activate nudges with timely, relevant pop-ups and overlays, never generic spam.",
      "rivals": null,
      "needs": [
        "website tag"
      ],
      "solves": [
        {
          "challenge": "growth",
          "sub_id": "grow-conversion",
          "label": "Low conversion"
        }
      ],
      "demo_screen": "Timed persuasive pop-up on a product page — customer-facing view",
      "metrics": {
        "commerce": {
          "value": "+10%",
          "label": "higher conversion",
          "context": "from persuasive pop-ups"
        },
        "travel": {
          "value": "+10%",
          "label": "higher conversion",
          "context": "from persuasive pop-ups"
        },
        "culture": {
          "value": "+10%",
          "label": "higher conversion",
          "context": "from persuasive pop-ups"
        }
      },
      "examples": {
        "commerce": "A shopper close to the free-delivery threshold sees how little more they need to add.",
        "travel": "A traveller weighing a trip sees that only a few rooms remain for their dates.",
        "culture": "A visitor weighing tickets sees that the popular slots are filling up fast."
      }
    },
    {
      "id": "rec-crosssell",
      "number": 11,
      "name": "Increase basket value",
      "hook": "They'd happily buy more. So ask, at the right moment.",
      "course": "convert",
      "capability": "Cross-sell and upsell at checkout",
      "capability_group": "Recommendations",
      "lifecycle": "Customer",
      "lifecycle_note": "bring back and grow",
      "setup": "addon",
      "type": "earn",
      "blurb": "Cross-sell and upsell at the right moment",
      "problem": "Customers buy one thing when they would happily have bought more.",
      "how": "Activate offers relevant add-ons and upgrades at the checkout, matched to the basket.",
      "rivals": "Manual \"related products\" blocks are static and rarely fit the cart.",
      "needs": [
        "product feed"
      ],
      "solves": [
        {
          "challenge": "growth",
          "sub_id": "grow-ordervalue",
          "label": "Low order value"
        },
        {
          "challenge": "retention",
          "sub_id": "ret-return",
          "label": "Customers do not return"
        }
      ],
      "demo_screen": "\"Complete your order with…\" cross-sell recommendations at checkout",
      "metrics": {
        "commerce": {
          "value": "+15%",
          "label": "higher order value",
          "context": "from cross-sell and upsell"
        },
        "travel": {
          "value": "+14%",
          "label": "higher trip value",
          "context": "from add-ons and upgrades"
        },
        "culture": {
          "value": "+12%",
          "label": "higher spend",
          "context": "from add-ons and upgrades"
        }
      },
      "examples": {
        "commerce": "A shopper buying a camera is offered the right case and spare battery at checkout.",
        "travel": "A traveller booking a flight is offered the matching transfer and bags.",
        "culture": "A visitor booking tickets is offered the guided tour and a drink on arrival."
      }
    },
    {
      "id": "abandoned-cart",
      "number": 12,
      "name": "Recover abandoned carts",
      "hook": "The sale isn't lost. It's one reminder away.",
      "course": "recover",
      "capability": "Abandoned cart",
      "capability_group": "Lifecycle automation",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "addon",
      "type": "earn",
      "blurb": "Win back shoppers who leave a full basket",
      "problem": "Shoppers add items, then leave before they pay, and the sale is lost.",
      "how": "Activate follows up with a timely, personalised reminder of exactly what was left behind.",
      "rivals": "Basic email tools send a generic nudge with no live cart or product detail.",
      "needs": [
        "website tag",
        "email"
      ],
      "solves": [
        {
          "challenge": "growth",
          "sub_id": "grow-conversion",
          "label": "Low conversion"
        }
      ],
      "demo_screen": "Abandoned cart recovery email showing exact products left behind + urgency signal",
      "metrics": {
        "commerce": {
          "value": "+22%",
          "label": "recovered revenue",
          "context": "from abandoned carts"
        },
        "travel": {
          "value": "+18%",
          "label": "recovered bookings",
          "context": "from abandoned searches"
        },
        "culture": {
          "value": "+20%",
          "label": "recovered revenue",
          "context": "from abandoned bookings"
        }
      },
      "examples": {
        "commerce": "A shopper who leaves a full basket gets a reminder showing those exact items, with one tap back to checkout.",
        "travel": "A traveller who abandons a booking gets a reminder of the trip and dates they had chosen.",
        "culture": "A visitor who leaves tickets in the basket gets a reminder of the event and the seats held."
      }
    },
    {
      "id": "browse-abandonment",
      "number": 13,
      "name": "Bring browsers back",
      "hook": "They looked. Follow up before they forget.",
      "course": "recover",
      "capability": "Browse abandonment",
      "capability_group": "Lifecycle automation",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "addon",
      "type": "earn",
      "blurb": "Follow up when someone looks but does not buy",
      "problem": "Plenty of people browse with real intent, then leave with no nudge to return.",
      "how": "Activate follows up on meaningful browsing, even when nothing reached the basket.",
      "rivals": null,
      "needs": [
        "website tag",
        "email"
      ],
      "solves": [
        {
          "challenge": "growth",
          "sub_id": "grow-conversion",
          "label": "Low conversion"
        }
      ],
      "demo_screen": "Browse abandonment email with a grid of recently viewed products",
      "metrics": {
        "commerce": {
          "value": "+16%",
          "label": "recovered revenue",
          "context": "from browse abandonment"
        },
        "travel": {
          "value": "+16%",
          "label": "recovered revenue",
          "context": "from browse abandonment"
        },
        "culture": {
          "value": "+16%",
          "label": "recovered revenue",
          "context": "from browse abandonment"
        }
      },
      "examples": {
        "commerce": "A shopper who studied three coats but added none gets a gentle follow-up featuring them.",
        "travel": "A traveller who compared trips without booking gets a follow-up with those options.",
        "culture": "A visitor who looked at several shows gets a reminder before they sell out."
      }
    },
    {
      "id": "back-in-stock",
      "number": 14,
      "name": "Bring shoppers back when products return",
      "hook": "Turn 'sold out' into a sale.",
      "course": "recover",
      "capability": "Back in stock",
      "capability_group": "Lifecycle automation",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "addon",
      "type": "earn",
      "blurb": "Alert interested shoppers the moment stock is back",
      "problem": "When a wanted item sells out, the demand simply disappears.",
      "how": "Activate captures interest in out-of-stock items and tells people the moment they return.",
      "rivals": null,
      "needs": [
        "product feed",
        "email"
      ],
      "solves": [
        {
          "challenge": "retention",
          "sub_id": "ret-return",
          "label": "Customers do not return"
        }
      ],
      "demo_screen": "Back-in-stock alert email triggered the moment a watched product is available again",
      "metrics": {
        "commerce": {
          "value": "+9%",
          "label": "recovered sales",
          "context": "from back-in-stock alerts"
        },
        "travel": {
          "value": "+9%",
          "label": "recovered sales",
          "context": "from back-in-stock alerts"
        },
        "culture": {
          "value": "+9%",
          "label": "recovered sales",
          "context": "from back-in-stock alerts"
        }
      },
      "examples": {
        "commerce": "A shopper after sold-out trainers is told the instant their size is back, with a direct link.",
        "travel": "A traveller after a sold-out date is told as soon as places open up again.",
        "culture": "A visitor after a sold-out show is told the moment returns or extra dates appear."
      }
    },
    {
      "id": "rec-email",
      "number": 15,
      "name": "Personalise product emails",
      "hook": "Every email, hand-picked, automatically.",
      "course": "grow",
      "capability": "Email recommendations",
      "capability_group": "Recommendations",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "addon",
      "type": "earn",
      "blurb": "Fill every email with products picked per customer",
      "problem": "Generic email blasts ignore what each person actually likes.",
      "how": "Activate drops personalised product picks into your emails, built from each profile.",
      "rivals": null,
      "needs": [
        "product feed",
        "email"
      ],
      "solves": [
        {
          "challenge": "growth",
          "sub_id": "grow-ordervalue",
          "label": "Low order value"
        }
      ],
      "demo_screen": "Personalised email with individually-picked product recommendations per customer",
      "metrics": {
        "commerce": {
          "value": "+18%",
          "label": "more revenue",
          "context": "from personalised emails"
        },
        "travel": {
          "value": "+18%",
          "label": "more revenue",
          "context": "from personalised emails"
        },
        "culture": {
          "value": "+18%",
          "label": "more revenue",
          "context": "from personalised emails"
        }
      },
      "examples": {
        "commerce": "A newsletter leads with the categories each shopper browses most, not a one-size-fits-all grid.",
        "travel": "A trip inspiration email features destinations matched to each traveller.",
        "culture": "A what-is-on email leads with the kind of events each member attends."
      }
    },
    {
      "id": "online-retargeting",
      "number": 16,
      "name": "Retarget shoppers with ads",
      "hook": "Spend ad budget on your people, not strangers.",
      "course": "grow",
      "capability": "Online retargeting",
      "capability_group": "Paid audience activation",
      "lifecycle": "Known visitor",
      "lifecycle_note": "to first purchase",
      "setup": "core",
      "type": "save",
      "blurb": "Reach your own audiences on Google and Meta",
      "problem": "Retargeting on raw ad-platform data is wasteful and easy to get wrong.",
      "how": "Activate syncs precise first-party audiences to Google and Meta, and keeps them fresh.",
      "rivals": "Pixel-only setups retarget people who already bought, burning budget.",
      "needs": [
        "Google and Meta"
      ],
      "solves": [
        {
          "challenge": "acquisition",
          "sub_id": "acq-expensive",
          "label": "Acquisition too expensive"
        },
        {
          "challenge": "acquisition",
          "sub_id": "acq-audience",
          "label": "Not reaching right audience"
        }
      ],
      "demo_screen": "CDP audiences synced to Google and Meta Ads — paid activation in Spotler Activate",
      "metrics": {
        "commerce": {
          "value": "25%",
          "label": "lower cost to win a customer",
          "context": "with first-party audiences"
        },
        "travel": {
          "value": "23%",
          "label": "lower cost to win a booking",
          "context": "with first-party audiences"
        },
        "culture": {
          "value": "22%",
          "label": "lower cost to win a visitor",
          "context": "with first-party audiences"
        }
      },
      "examples": {
        "commerce": "People who browsed but did not buy are retargeted, and drop out the moment they purchase.",
        "travel": "People who searched trips but did not book are retargeted, and stop the second they book.",
        "culture": "People who viewed events but did not buy are retargeted until they have their tickets."
      }
    },
    {
      "id": "followup-loyalty",
      "number": 17,
      "name": "Turn buyers into repeat customers",
      "hook": "Turn one purchase into a habit.",
      "course": "grow",
      "capability": "Follow-up and loyalty emails",
      "capability_group": "Lifecycle automation",
      "lifecycle": "Customer",
      "lifecycle_note": "bring back and grow",
      "setup": "addon",
      "type": "earn",
      "blurb": "Follow up after the sale and reward loyalty",
      "problem": "After the first sale, most customers drift away without a word.",
      "how": "Activate runs automated follow-up and loyalty journeys that keep people coming back.",
      "rivals": null,
      "needs": [
        "email"
      ],
      "solves": [
        {
          "challenge": "retention",
          "sub_id": "ret-return",
          "label": "Customers do not return"
        }
      ],
      "demo_screen": "Post-purchase follow-up email with loyalty reward and next-purchase offer",
      "metrics": {
        "commerce": {
          "value": "+21%",
          "label": "more repeat revenue",
          "context": "from follow-up emails"
        },
        "travel": {
          "value": "+21%",
          "label": "more repeat revenue",
          "context": "from follow-up emails"
        },
        "culture": {
          "value": "+21%",
          "label": "more repeat revenue",
          "context": "from follow-up emails"
        }
      },
      "examples": {
        "commerce": "A first-time buyer gets a thoughtful follow-up, then timely nudges that earn the second order.",
        "travel": "A first-time traveller gets a warm follow-up and an offer for their next trip.",
        "culture": "A first-time visitor gets a thank-you and a reason to come back next season."
      }
    },
    {
      "id": "predictive-clv",
      "number": 18,
      "name": "Identify future high-value customers",
      "hook": "Know who's worth it before they prove it.",
      "course": "grow",
      "capability": "Predictive CLV and decile segments",
      "capability_group": "Predictive AI",
      "lifecycle": "Loyal customer",
      "lifecycle_note": "retain and win back",
      "setup": "addon",
      "type": "earn",
      "blurb": "Predict who will be worth the most over time",
      "problem": "You treat every customer the same, so you over-invest in some and lose others.",
      "how": "Activate predicts customer value and groups people by decile, so effort goes where it pays.",
      "rivals": "Rule-based scoring misses the patterns that real prediction picks up.",
      "needs": [
        "order history"
      ],
      "solves": [
        {
          "challenge": "retention",
          "sub_id": "ret-return",
          "label": "Customers do not return"
        }
      ],
      "demo_screen": "Predictive CLV and decile-segment dashboard in Spotler Activate",
      "metrics": {
        "commerce": {
          "value": "+19%",
          "label": "more revenue",
          "context": "from your highest-value customers"
        },
        "travel": {
          "value": "+19%",
          "label": "more revenue",
          "context": "from your highest-value customers"
        },
        "culture": {
          "value": "+19%",
          "label": "more revenue",
          "context": "from your highest-value customers"
        }
      },
      "examples": {
        "commerce": "Your top-decile shoppers get VIP treatment, while at-risk ones get a timely win-back.",
        "travel": "Your highest-value travellers get priority offers, while lapsing ones get a nudge back.",
        "culture": "Your most valuable members get early access, while at-risk ones get a reason to return."
      }
    }
  ]
};
