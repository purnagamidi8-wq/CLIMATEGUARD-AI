import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

# Colors
NAVY = RGBColor(0x0F, 0x17, 0x2A)       # #0F172A
DEEP_BLUE = RGBColor(0x1E, 0x3A, 0x8A)  # #1E3A8A
TEAL = RGBColor(0x0D, 0x94, 0x88)       # #0D9488
CYAN = RGBColor(0x06, 0xB6, 0xD4)       # #06B6D4
CORAL = RGBColor(0xEF, 0x44, 0x44)      # #EF4444
AMBER = RGBColor(0xF5, 0x9E, 0x0B)      # #F59E0B
EMERALD = RGBColor(0x10, 0xB9, 0x81)    # #10B981
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
SLATE_BG = RGBColor(0xF1, 0xF5, 0xF9)   # #F1F5F9
SLATE_CARD = RGBColor(0x1E, 0x29, 0x3B) # #1E293B
GRAY_TEXT = RGBColor(0x64, 0x74, 0x8B)  # #64748B
LIGHT_TEXT = RGBColor(0xCB, 0xD5, 0xE1) # #CBD5E1
DARK_TEXT = RGBColor(0x0F, 0x17, 0x2A)  # #0F172A
BORDER_GRAY = RGBColor(0xCC, 0xD6, 0xE4)
LIGHT_BLUE = RGBColor(0xDB, 0xEA, 0xFE)
LIGHT_RED = RGBColor(0xFE, 0xE2, 0xE2)
LIGHT_AMBER = RGBColor(0xFE, 0xF3, 0xC7)
LIGHT_TEAL = RGBColor(0xCC, 0xFB, 0xF1)

FONT_HEADING = "Segoe UI"
FONT_BODY = "Segoe UI"

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    total_slides = 14

    def add_base_decorations(slide, slide_num, dark=True):
        # Top accent bar
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.1))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = TEAL if slide_num % 2 == 1 else AMBER
        top_bar.line.fill.background()

        # Bottom watermark
        wm = slide.shapes.add_textbox(Inches(0.8), Inches(7.1), Inches(4.0), Inches(0.3))
        tf = wm.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "🌍 ClimateGuard AI • Hackathon Edition 2026"
        p.font.name = FONT_BODY
        p.font.size = Pt(9)
        p.font.color.rgb = GRAY_TEXT if not dark else RGBColor(0x64, 0x74, 0x8B)

        # Slide Number
        sn = slide.shapes.add_textbox(Inches(10.5), Inches(7.1), Inches(2.0), Inches(0.3))
        tf = sn.text_frame
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.RIGHT
        p.text = f"{slide_num} / {total_slides}"
        p.font.name = FONT_BODY
        p.font.size = Pt(9)
        p.font.color.rgb = GRAY_TEXT if not dark else RGBColor(0x64, 0x74, 0x8B)

    def set_slide_bg(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_card(slide, left, top, width, height, bg_color=WHITE, border_color=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    # ==========================================
    # SLIDE 1 — TITLE / HERO SLIDE
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide1, NAVY)

    # Decorative hero backdrop glow
    glow = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    glow.fill.solid()
    glow.fill.fore_color.rgb = DEEP_BLUE
    glow.line.color.rgb = TEAL
    glow.line.width = Pt(1.5)

    add_base_decorations(slide1, 1, dark=True)

    # Top Pill
    pill = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(1.2), Inches(3.8), Inches(0.42))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(0x13, 0x4E, 0x4A)
    pill.line.color.rgb = TEAL
    p = pill.text_frame.paragraphs[0]
    p.text = "⚡ HACKATHON DEMO 2026 • BUILT WITH GEMINI AI"
    p.font.name = FONT_HEADING
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p.alignment = PP_ALIGN.CENTER

    # Main Title
    tb = slide1.shapes.add_textbox(Inches(1.3), Inches(1.8), Inches(10.5), Inches(1.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🌍 ClimateGuard AI"
    p.font.name = FONT_HEADING
    p.font.size = Pt(46)
    p.font.bold = True
    p.font.color.rgb = WHITE

    # Subtitle
    tb2 = slide1.shapes.add_textbox(Inches(1.3), Inches(3.0), Inches(10.5), Inches(0.9))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p2 = tf2.paragraphs[0]
    p2.text = "Multilingual, Location-Aware Climate Risk Information & Emergency Preparedness Agent"
    p2.font.name = FONT_BODY
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = CYAN

    p2b = tf2.add_paragraph()
    p2b.text = "Protecting Lives Through Real-Time AI Intelligence & Offline Disaster Resilience"
    p2b.font.name = FONT_BODY
    p2b.font.size = Pt(14)
    p2b.font.color.rgb = AMBER

    # 3 Stat Cards at bottom
    stats = [
        ("7 Indian Languages", "EN, TE, HI, TA, KN, ML, MR with Instant Translation", TEAL),
        ("6 Climate Hazards", "Deterministic 0-100 Multi-Hazard Scoring Engine", AMBER),
        ("10 Verified Helplines", "ERSS 112, NDRF 1078, SDMA 1070 & Direct Speed Dial", CORAL),
    ]

    for i, (title, desc, color) in enumerate(stats):
        cx = Inches(1.3 + i * 3.65)
        cy = Inches(4.3)
        cw = Inches(3.4)
        ch = Inches(1.9)
        c = add_card(slide1, cx, cy, cw, ch, bg_color=SLATE_CARD, border_color=color)
        tb_card = slide1.shapes.add_textbox(cx + Inches(0.15), cy + Inches(0.15), cw - Inches(0.3), ch - Inches(0.3))
        tfc = tb_card.text_frame
        tfc.word_wrap = True
        p = tfc.paragraphs[0]
        p.text = title
        p.font.name = FONT_HEADING
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = color
        
        p_desc = tfc.add_paragraph()
        p_desc.text = desc
        p_desc.font.name = FONT_BODY
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = LIGHT_TEXT

    # ==========================================
    # SLIDE 2 — THE PROBLEM
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide2, SLATE_BG)
    add_base_decorations(slide2, 2, dark=False)

    # Section Label & Title
    tb = slide2.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "THE CHALLENGE • CLIMATE VULNERABILITY IN INDIA"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = CORAL

    p2 = tf.add_paragraph()
    p2.text = "India's Climate Crisis: Are We Truly Prepared?"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(32)
    p2.font.bold = True
    p2.font.color.rgb = NAVY

    # 3 Cards
    problems = [
        ("🌊 Floods & Inundations", "2,500+ Deaths Annually",
         "Flash floods and monsoon cloudbursts displace over 30 million citizens each year. Most rural and peri-urban communities receive zero localized, actionable advance warning before drainage systems overflow.",
         CORAL, LIGHT_RED),
        ("🌡️ Extreme Heatwaves", "4,000+ Fatalities Yearly",
         "Summer temperatures consistently breach 45°C–49°C across central and northern India. Vulnerable outdoor workers, farmers, and elderly citizens have no personalized hydration or shelter advisories.",
         AMBER, LIGHT_AMBER),
        ("🌀 Coastal Cyclones", "7,500 km Coastal Vulnerability",
         "Severe cyclonic storms cause billions in infrastructure loss. Evacuation shelters exist, but citizens lack real-time GPS navigation to nearest shelters in their native regional language during blackouts.",
         DEEP_BLUE, LIGHT_BLUE),
    ]

    for i, (head, stat, body, col, bg_light) in enumerate(problems):
        cx = Inches(0.8 + i * 3.98)
        cy = Inches(1.7)
        cw = Inches(3.75)
        ch = Inches(3.8)
        c = add_card(slide2, cx, cy, cw, ch, bg_color=WHITE, border_color=col)
        
        # Header banner inside card
        banner = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.2), cy + Inches(0.2), cw - Inches(0.4), Inches(0.85))
        banner.fill.solid()
        banner.fill.fore_color.rgb = bg_light
        banner.line.fill.background()
        p = banner.text_frame.paragraphs[0]
        p.text = head
        p.font.name = FONT_HEADING
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = col
        p_sub = banner.text_frame.add_paragraph()
        p_sub.text = stat
        p_sub.font.name = FONT_BODY
        p_sub.font.size = Pt(11)
        p_sub.font.bold = True
        p_sub.font.color.rgb = DARK_TEXT

        # Content inside card
        tb_body = slide2.shapes.add_textbox(cx + Inches(0.2), cy + Inches(1.15), cw - Inches(0.4), ch - Inches(1.3))
        tfb = tb_body.text_frame
        tfb.word_wrap = True
        pb = tfb.paragraphs[0]
        pb.text = body
        pb.font.name = FONT_BODY
        pb.font.size = Pt(13)
        pb.font.color.rgb = DARK_TEXT

    # Bottom Callout Box
    callout = add_card(slide2, Inches(0.8), Inches(5.75), Inches(11.73), Inches(1.1), bg_color=LIGHT_AMBER, border_color=AMBER)
    tfc = callout.text_frame
    tfc.word_wrap = True
    p = tfc.paragraphs[0]
    p.text = "⚠️ THE CRITICAL GAP: LANGUAGE BARRIER & CONNECTIVITY BLACKOUTS"
    p.font.name = FONT_HEADING
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0x92, 0x40, 0x0E)
    p_desc = tfc.add_paragraph()
    p_desc.text = "Existing disaster apps are English-only and crash when mobile towers fail. ClimateGuard AI solves this with 7 Indian languages, offline PWA caching, and local emergency broadcast intelligence."
    p_desc.font.name = FONT_BODY
    p_desc.font.size = Pt(12)
    p_desc.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 3 — OUR SOLUTION
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide3, NAVY)
    add_base_decorations(slide3, 3, dark=True)

    tb = slide3.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.2))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "INNOVATION ARCHITECTURE • THE SOLUTION"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p2 = tf.add_paragraph()
    p2.text = "Introducing ClimateGuard AI"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(32)
    p2.font.bold = True
    p2.font.color.rgb = WHITE

    p3 = tf.add_paragraph()
    p3.text = "One Platform. Every Climate Hazard. In Your Mother Tongue. At Your Exact Location."
    p3.font.name = FONT_BODY
    p3.font.size = Pt(14)
    p3.font.color.rgb = CYAN

    # Center Hub - 6 Solution Pillars in 2x3 grid
    solutions = [
        ("🤖 Gemini 2.0 AI + RAG", "Context-aware reasoning backed by ChromaDB vector store of official NDMA disaster circulars.", TEAL),
        ("📊 Deterministic Risk Engine", "0–100 multi-hazard scoring using real-time Open-Meteo meteorological thresholds, not guesswork.", AMBER),
        ("🗺️ Live GIS Safe Havens Map", "Automated discovery of nearby relief shelters, hospitals, and fire units with distance ranking.", CYAN),
        ("🌐 7 Native Indian Languages", "Complete UI and conversational AI support in Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi & English.", EMERALD),
        ("🚨 1-Tap Emergency SOS & 112", "Instant GPS coordinates capture, direct 112 dialing, WhatsApp location share, and contact alerts.", CORAL),
        ("📴 Offline-First PWA Resilience", "Service worker and IndexedDB caching ensure essential survival checklists work during cellular blackout.", WHITE),
    ]

    for i, (title, desc, color) in enumerate(solutions):
        col = i % 3
        row = i // 3
        cx = Inches(0.8 + col * 3.98)
        cy = Inches(1.8 + row * 2.1)
        cw = Inches(3.75)
        ch = Inches(1.9)
        c = add_card(slide3, cx, cy, cw, ch, bg_color=SLATE_CARD, border_color=color)
        tfc = c.text_frame
        tfc.word_wrap = True
        p = tfc.paragraphs[0]
        p.text = title
        p.font.name = FONT_HEADING
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = color
        p_desc = tfc.add_paragraph()
        p_desc.text = desc
        p_desc.font.name = FONT_BODY
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = LIGHT_TEXT

    # Bottom Pill
    pill_bottom = add_card(slide3, Inches(0.8), Inches(6.15), Inches(11.73), Inches(0.7), bg_color=RGBColor(0x13, 0x4E, 0x4A), border_color=TEAL)
    p = pill_bottom.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = "✅ Free Open-Meteo API (Zero API Cost)  •  ✅ Zero Cloud Dependency for SQLite  •  ✅ Real-time Device Audio Alarms"
    p.font.name = FONT_HEADING
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 4 — KEY FEATURES (12 FEATURES GRID)
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide4, SLATE_BG)
    add_base_decorations(slide4, 4, dark=False)

    tb = slide4.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "SYSTEM CAPABILITIES"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p2 = tf.add_paragraph()
    p2.text = "12 Production-Grade Features in One Platform"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = NAVY

    features = [
        ("🌤️ Live Weather Data", "Real-time temp, humidity, wind, rainfall via Open-Meteo", TEAL),
        ("📊 0-100 Risk Scoring", "Additive multi-hazard deterministic scoring logic", AMBER),
        ("🗺️ Interactive GIS Map", "Leaflet GIS with 4 tile layers & GPS radar pulse", CYAN),
        ("🚨 1-Tap SOS Modal", "Captures GPS, dials 112, dispatches SMS location", CORAL),
        ("📞 10 Govt Helplines", "ERSS 112, NDRF 1078, SDMA 1070 with 1-tap call", DEEP_BLUE),
        ("🛡️ Safe Places Finder", "Finds nearby hospitals, cyclone shelters & fire units", EMERALD),
        ("🤖 Gemini RAG AI Chat", "Context-rich safety advice citing official NDMA circulars", TEAL),
        ("🌐 7 Native Languages", "Full i18n dictionaries for EN, TE, HI, TA, KN, ML, MR", AMBER),
        ("📋 NDMA Checklists", "Interactive preparedness progress tracker per hazard", CYAN),
        ("📴 Offline PWA Mode", "Service Worker + IndexedDB keeps app functioning offline", CORAL),
        ("🔊 Emergency Audio Alarms", "Web Audio API synthesized 880Hz siren + device vibration", DEEP_BLUE),
        ("🖨️ Print Briefing Sheet", "Generates clean A4 emergency dispatch evacuation summary", EMERALD),
    ]

    for i, (title, desc, color) in enumerate(features):
        col = i % 4
        row = i // 4
        cx = Inches(0.8 + col * 2.98)
        cy = Inches(1.4 + row * 1.7)
        cw = Inches(2.8)
        ch = Inches(1.5)
        c = add_card(slide4, cx, cy, cw, ch, bg_color=WHITE, border_color=BORDER_GRAY)
        
        # Color top bar inside card
        top_accent = slide4.shapes.add_shape(MSO_SHAPE.RECTANGLE, cx + Inches(0.05), cy + Inches(0.05), cw - Inches(0.1), Inches(0.08))
        top_accent.fill.solid()
        top_accent.fill.fore_color.rgb = color
        top_accent.line.fill.background()

        tfc = c.text_frame
        tfc.word_wrap = True
        p = tfc.paragraphs[0]
        p.text = title
        p.font.name = FONT_HEADING
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = NAVY
        p_desc = tfc.add_paragraph()
        p_desc.text = desc
        p_desc.font.name = FONT_BODY
        p_desc.font.size = Pt(10.5)
        p_desc.font.color.rgb = GRAY_TEXT

    # ==========================================
    # SLIDE 5 — HOW RISK IS CALCULATED
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide5, WHITE)
    add_base_decorations(slide5, 5, dark=False)

    tb = slide5.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "METEOROLOGICAL HEURISTICS & VALIDATED THRESHOLDS"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = DEEP_BLUE

    p2 = tf.add_paragraph()
    p2.text = "Deterministic Multi-Hazard Risk Scoring Engine"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = NAVY

    p3 = tf.add_paragraph()
    p3.text = "Scores range from 0 to 100 based on physical thresholds published by IMD, NDMA, and WMO."
    p3.font.name = FONT_BODY
    p3.font.size = Pt(13)
    p3.font.color.rgb = GRAY_TEXT

    hazards = [
        ("🌊 Flood Risk", "Precipitation >50mm/hr (+50pts) • Soil Saturation >0.40 (+15pts) • 24h Rain Forecast >100mm (+40pts)", "Open-Meteo & IMD Rain Gauge", DEEP_BLUE),
        ("🌡️ Heatwave Risk", "Temp >44°C (+50pts) • Feels-Like >45°C (+40pts) • UV Index >10 (+15pts) • Low Humidity Compound", "IMD Heat Action Plan Guidelines", AMBER),
        ("🌀 Cyclone Risk", "Sustained Winds >90 km/h (+60pts) • Gusts >105 km/h (+30pts) • Surface Pressure <990 hPa (+15pts)", "NDRF Cyclone Category Standard", CYAN),
        ("⚡ Lightning Storm", "WMO Code 99 (Violent Thunderstorm + Hail) (+80pts) • WMO Code 96 (+70pts) • Code 95 (+60pts)", "WMO Standard Weather Codes", RGBColor(0x7C, 0x3A, 0xED)),
        ("🌾 Drought Risk", "Zero Precipitation + Soil Moisture <0.08 (+65pts) • Temperature >38°C (+25pts) • 7-day Dry Forecast", "IMD Meteorological Drought Indices", RGBColor(0xD9, 0x77, 0x06)),
        ("🔥 Wildfire Risk", "Compound Triple Trigger: Temp >36°C + Humidity <20% + Wind >25 km/h (+75pts)", "Canadian Fire Weather / NDMA Standard", CORAL),
    ]

    for i, (title, formula, source, color) in enumerate(hazards):
        cx = Inches(0.8)
        cy = Inches(1.8 + i * 0.85)
        cw = Inches(11.73)
        ch = Inches(0.72)
        card = add_card(slide5, cx, cy, cw, ch, bg_color=SLATE_BG, border_color=color)
        tfc = card.text_frame
        tfc.word_wrap = True
        p = tfc.paragraphs[0]
        p.text = f"{title}   |   {formula}"
        p.font.name = FONT_HEADING
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = color
        p_src = tfc.add_paragraph()
        p_src.text = f"Source Standard: {source}"
        p_src.font.name = FONT_BODY
        p_src.font.size = Pt(9.5)
        p_src.font.color.rgb = GRAY_TEXT

    # ==========================================
    # SLIDE 6 — AI AGENT & RAG SYSTEM
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide6, NAVY)
    add_base_decorations(slide6, 6, dark=True)

    tb = slide6.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "ARTIFICIAL INTELLIGENCE & RETRIEVAL-AUGMENTED GENERATION"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p2 = tf.add_paragraph()
    p2.text = "Gemini 2.0 Flash + ChromaDB RAG Agent"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = WHITE

    # Left: Flow Pipeline
    cx_left = Inches(0.8)
    cw_left = Inches(5.2)
    card_pipe = add_card(slide6, cx_left, Inches(1.5), cw_left, Inches(5.1), bg_color=SLATE_CARD, border_color=TEAL)
    tfp = card_pipe.text_frame
    tfp.word_wrap = True
    p = tfp.paragraphs[0]
    p.text = "Interactive RAG Pipeline"
    p.font.name = FONT_HEADING
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = CYAN

    steps = [
        ("1. User Query in Native Language", "Query submitted in Telugu, Hindi, Tamil, etc."),
        ("2. Location & Risk Injection", "Latitude/longitude and active 0-100 risk score appended to context."),
        ("3. ChromaDB Vector Similarity Search", "Matches official NDMA Standard Operating Procedures embeddings."),
        ("4. Safe Places Geospatial Context", "Nearby shelters, hospital phone numbers and distances injected."),
        ("5. Gemini 2.0 Flash Reasoning", "Synthesizes life-safety directions in structured format."),
        ("6. 4-Part Structured Response", "Delivers WHY / WHAT / WHERE / WHO guidance."),
    ]
    for st, sub in steps:
        p_step = tfp.add_paragraph()
        p_step.text = f"• {st}"
        p_step.font.name = FONT_HEADING
        p_step.font.size = Pt(11.5)
        p_step.font.bold = True
        p_step.font.color.rgb = WHITE
        p_sub = tfp.add_paragraph()
        p_sub.text = f"   {sub}"
        p_sub.font.name = FONT_BODY
        p_sub.font.size = Pt(10)
        p_sub.font.color.rgb = LIGHT_TEXT

    # Right: Structured Output Cards
    cx_right = Inches(6.3)
    cw_right = Inches(6.2)

    examples = [
        ("WHY (Hazard Diagnostics):", "Severe Cyclone Warning: Sustained gale-force winds of 95 km/h with heavy storm surge expected along coastal areas in the next 4 hours.", CYAN),
        ("WHAT (Protective Actions):", "Evacuate basement floors immediately. Turn off main circuit breaker. Secure all rooftop tin sheets. Keep transistor radio tuned to AIR.", AMBER),
        ("WHERE (Safe Havens & Shelters):", "GHMC Cyclone Relief Shelter, MVP Colony — 2.4 km away (Walking: 28 min, Driving: 8 min). Ph: 0891-2564890. Capacity: 500 persons.", EMERALD),
        ("WHO (Emergency Helpline Dispatch):", "Call ERSS 112 for general distress. Call NDRF Control Room 1078 for flood boat rescue. SDMA Control: 1070.", CORAL),
    ]

    for i, (tag, content, col) in enumerate(examples):
        cy = Inches(1.5 + i * 1.28)
        card = add_card(slide6, cx_right, cy, cw_right, Inches(1.18), bg_color=SLATE_CARD, border_color=col)
        tfe = card.text_frame
        tfe.word_wrap = True
        p = tfe.paragraphs[0]
        p.text = tag
        p.font.name = FONT_HEADING
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = col
        p_body = tfe.add_paragraph()
        p_body.text = content
        p_body.font.name = FONT_BODY
        p_body.font.size = Pt(10)
        p_body.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 7 — EMERGENCY RESPONSE FEATURES
    # ==========================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide7, SLATE_BG)
    add_base_decorations(slide7, 7, dark=False)

    tb = slide7.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "RAPID LIFE-SAFETY DISPATCH"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = CORAL

    p2 = tf.add_paragraph()
    p2.text = "⚡ Instant Emergency Response Architecture"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = NAVY

    # Left: SOS System
    card_sos = add_card(slide7, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.1), bg_color=WHITE, border_color=CORAL)
    tfs = card_sos.text_frame
    tfs.word_wrap = True
    p = tfs.paragraphs[0]
    p.text = "🆘 1-Tap SOS Emergency Modal"
    p.font.name = FONT_HEADING
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = CORAL

    sos_points = [
        ("📍 Instant GPS Precision", "Auto-captures exact latitude, longitude, reverse-geocoded city, and Google Maps pin link."),
        ("📞 Direct 112 Speed Dial", "One-click connection to MHA Emergency Response Support System (ERSS) with zero typing."),
        ("💬 WhatsApp & SMS Broadcast", "Pre-formats an emergency distress message with coordinates for immediate family dispatch."),
        ("👥 Trusted Contacts Network", "Notifies enrolled emergency contacts with active hazard status and severity level."),
        ("🔊 Audible Alert Chime", "Synthesizes an 880Hz emergency alarm and triggers device vibration on mobile devices."),
    ]
    for title, desc in sos_points:
        pt = tfs.add_paragraph()
        pt.text = f"• {title}"
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = NAVY
        pd = tfs.add_paragraph()
        pd.text = f"   {desc}"
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = GRAY_TEXT

    # Right: Verified Helplines Directory
    card_hl = add_card(slide7, Inches(6.7), Inches(1.5), Inches(5.8), Inches(5.1), bg_color=WHITE, border_color=DEEP_BLUE)
    tfh = card_hl.text_frame
    tfh.word_wrap = True
    p = tfh.paragraphs[0]
    p.text = "📞 Verified Government Helplines Directory"
    p.font.name = FONT_HEADING
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = DEEP_BLUE

    helplines = [
        ("112", "Emergency Response Support System (ERSS)", "All-in-One National Emergency"),
        ("1078", "NDRF Control Room", "Flood Boat Rescue & Disaster Specialists"),
        ("1070", "State Disaster Management (SDMA)", "State Emergency Operations Center"),
        ("1077", "District Disaster Management (DDMA)", "District Collectorate Control"),
        ("108", "Emergency Ambulance", "Free Critical Medical Transport"),
        ("101", "Fire Brigade Control Room", "Fire & Structural Collapse Rescue"),
        ("100", "Police Emergency Control", "Law & Order, Crowd Evacuation"),
        ("1091", "Women's Safety Helpline", "24/7 Female Distress & Shelter Support"),
    ]
    for num, name, sub in helplines:
        ph = tfh.add_paragraph()
        ph.text = f"☎ {num}  —  {name} ({sub})"
        ph.font.name = FONT_BODY
        ph.font.size = Pt(11)
        ph.font.bold = True
        ph.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 8 — MULTILINGUAL SUPPORT
    # ==========================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide8, SLATE_BG)
    add_base_decorations(slide8, 8, dark=False)

    tb = slide8.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "INCLUSIVE DISASTER COMMUNICATION"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = EMERALD

    p2 = tf.add_paragraph()
    p2.text = "🌐 7 Indian Languages — Full Native Support"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = NAVY

    langs = [
        ("English", "English", "EN", "Severe Flood Warning — Evacuate to high ground immediately", DEEP_BLUE),
        ("Telugu", "తెలుగు", "TE", "తీవ్రమైన వరద హెచ్చరిక — తక్షణమే ఎత్తైన ప్రదేశాలకు వెళ్ళండి", TEAL),
        ("Hindi", "हिन्दी", "HI", "गंभीर बाढ़ की चेतावनी — तुरंत सुरक्षित ऊंचाई वाले स्थान पर जाएं", AMBER),
        ("Tamil", "தமிழ்", "TA", "கடுமையான வெள்ள எச்சரிக்கை — உடனடியாக பாதுகாப்பான பகுதிக்கு செல்லுங்கள்", CORAL),
        ("Kannada", "ಕನ್ನಡ", "KN", "ತೀವ್ರ ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ — ತಕ್ಷಣ ಸುರಕ್ಷಿತ ಎತ್ತರದ ಪ್ರದೇಶಕ್ಕೆ ತೆರಳಿ", RGBColor(0x7C, 0x3A, 0xED)),
        ("Malayalam", "മലയാളം", "ML", "കടുത്ത വെള്ളപ്പൊക്ക മുന്നറിയിപ്പ് — ഉടൻ തന്നെ സുരക്ഷിത സ്ഥാനത്തേക്ക് മാറുക", RGBColor(0x05, 0x96, 0x69)),
        ("Marathi", "मराठी", "MR", "तीव्र पूर चेतावणी — त्वरित सुरक्षित उंच जागी जावे", RGBColor(0xD9, 0x77, 0x06)),
    ]

    for i, (name, native, code, sample, col) in enumerate(langs):
        col_idx = i % 2
        row_idx = i // 2
        cx = Inches(0.8 + col_idx * 5.95)
        cy = Inches(1.5 + row_idx * 1.3)
        cw = Inches(5.75)
        ch = Inches(1.15)
        card = add_card(slide8, cx, cy, cw, ch, bg_color=WHITE, border_color=col)
        tfl = card.text_frame
        tfl.word_wrap = True
        p = tfl.paragraphs[0]
        p.text = f"{native} ({name}) • [{code}]"
        p.font.name = FONT_HEADING
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = col
        p_samp = tfl.add_paragraph()
        p_samp.text = f"\"{sample}\""
        p_samp.font.name = FONT_BODY
        p_samp.font.size = Pt(11)
        p_samp.font.color.rgb = DARK_TEXT

    # Bottom stat
    card_stat = add_card(slide8, Inches(0.8), Inches(5.8), Inches(11.73), Inches(0.95), bg_color=RGBColor(0xEC, 0xFD, 0xF5), border_color=EMERALD)
    tfc = card_stat.text_frame
    tfc.word_wrap = True
    p = tfc.paragraphs[0]
    p.text = "✅ COMPLETE LOCALIZATION • 60+ TRANSLATION KEYS PER LANGUAGE"
    p.font.name = FONT_HEADING
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)
    p2 = tfc.add_paragraph()
    p2.text = "Language changes instantly dynamically updates document.documentElement.lang for screen readers, and prompts Gemini to respond natively in the selected language."
    p2.font.name = FONT_BODY
    p2.font.size = Pt(11)
    p2.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 9 — LIVE GIS MAP & SAFE PLACES
    # ==========================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide9, SLATE_BG)
    add_base_decorations(slide9, 9, dark=False)

    tb = slide9.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "GEOSPATIAL EVACUATION LOGISTICS"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = CYAN

    p2 = tf.add_paragraph()
    p2.text = "🗺️ Real-Time GIS Evacuation & Safe Havens Map"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = NAVY

    # Left: GIS Capabilities
    card_gis = add_card(slide9, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.2), bg_color=WHITE, border_color=CYAN)
    tfg = card_gis.text_frame
    tfg.word_wrap = True
    p = tfg.paragraphs[0]
    p.text = "GIS Mapping Engine Features"
    p.font.name = FONT_HEADING
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = DEEP_BLUE

    gis_features = [
        ("📍 Custom HTML DivIcon Markers", "Distinct color-coded pins for hospitals (🏥), cyclone shelters (🌀), fire units (🚒), and police stations (🚓)."),
        ("⭕ Dynamic 6km Risk Perimeter", "Color-coded circle (green, yellow, orange, red) displaying current localized threat zone around GPS location."),
        ("🌐 4 Tile Layer Providers", "Instant switching between OpenStreetMap, CartoDB Light, CartoDB Dark, and OpenTopoMap topography."),
        ("🎯 FlyTo Recenter Navigation", "Smoothly animates camera back to user GPS coordinates upon request."),
        ("🖨️ A4 Emergency Briefing Export", "Print-optimized CSS hides navigation bars to generate official emergency dispatch briefing sheets."),
    ]
    for title, desc in gis_features:
        pt = tfg.add_paragraph()
        pt.text = f"• {title}"
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = NAVY
        pd = tfg.add_paragraph()
        pd.text = f"   {desc}"
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = GRAY_TEXT

    # Right: Safe Places Sample Logistics
    card_sp = add_card(slide9, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.2), bg_color=WHITE, border_color=EMERALD)
    tfs = card_sp.text_frame
    tfs.word_wrap = True
    p = tfs.paragraphs[0]
    p.text = "Discovered Emergency Facilities"
    p.font.name = FONT_HEADING
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = EMERALD

    facilities = [
        ("King George Hospital (KGH)", "🏥 Hospital • 1.2 km away", "Walk: 15 min | Drive: 4 min | Ph: 0891-2564891"),
        ("GHMC Cyclone Relief Shelter", "🌀 Cyclone Shelter • 2.4 km away", "Walk: 28 min | Drive: 8 min | Ph: 0891-2564890"),
        ("Suryabagh Fire & Rescue Unit", "🚒 Fire Station • 1.8 km away", "Walk: 22 min | Drive: 5 min | Ph: 101"),
        ("Two Town Police Control Room", "🚓 Police Control • 0.9 km away", "Walk: 11 min | Drive: 3 min | Ph: 100"),
        ("Red Cross Disaster Camp", "🛡️ Emergency Shelter • 3.1 km away", "Walk: 36 min | Drive: 10 min | Ph: 0891-2748920"),
    ]
    for name, type_dist, times in facilities:
        pf = tfs.add_paragraph()
        pf.text = f"{name}"
        pf.font.name = FONT_HEADING
        pf.font.size = Pt(12)
        pf.font.bold = True
        pf.font.color.rgb = NAVY
        pft = tfs.add_paragraph()
        pft.text = f"   {type_dist}  |  {times}"
        pft.font.name = FONT_BODY
        pft.font.size = Pt(10)
        pft.font.color.rgb = GRAY_TEXT

    # ==========================================
    # SLIDE 10 — TECHNOLOGY STACK
    # ==========================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide10, NAVY)
    add_base_decorations(slide10, 10, dark=True)

    tb = slide10.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "SOFTWARE ARCHITECTURE & DEPENDENCIES"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p2 = tf.add_paragraph()
    p2.text = "🛠️ Modern Full-Stack Technology Stack"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = WHITE

    stack_cols = [
        ("FRONTEND ECOSYSTEM", [
            ("React 18 + Vite 8", "High-performance modular SPA build in <800ms"),
            ("Tailwind CSS 4.3", "Modern responsive utility styling & animations"),
            ("Leaflet 1.9 & React-Leaflet", "Interactive GIS maps with custom HTML divIcons"),
            ("Recharts", "Multi-hazard threat distribution bar charts"),
            ("Service Worker PWA", "Offline network-first and stale-while-revalidate"),
            ("IndexedDB Cache", "Local persistence of weather, risk & alerts"),
        ], TEAL),
        ("BACKEND ARCHITECTURE", [
            ("FastAPI (Python 3.10)", "Asynchronous high-throughput REST API"),
            ("SQLAlchemy ORM", "11 database models with relational integrity"),
            ("SQLite (PostgreSQL-Ready)", "Zero-configuration local database for hackathons"),
            ("JWT Security & Bcrypt", "Role-based authentication & encrypted profiles"),
            ("Gemini 2.0 Flash API", "Multilingual reasoning & prompt engineering"),
            ("ChromaDB Vector Store", "In-process vector database with MiniLM embeddings"),
        ], AMBER),
        ("DATA & GEOSPATIAL SERVICES", [
            ("Open-Meteo Weather API", "Free hourly/daily weather with zero API keys"),
            ("Nominatim OpenStreetMap", "Reverse geocoding from GPS coordinates to city"),
            ("OSM Overpass API", "Live emergency hospital/fire/shelter discovery"),
            ("NDMA India Safety Circulars", "Authoritative disaster checklists & actions"),
            ("IMD Meteorological Standards", "Calibrated hazard thresholds for rainfall & heat"),
            ("MHA ERSS 112 Directory", "Verified emergency government helpline database"),
        ], CORAL),
    ]

    for i, (title, items, color) in enumerate(stack_cols):
        cx = Inches(0.8 + i * 3.98)
        cy = Inches(1.5)
        cw = Inches(3.75)
        ch = Inches(5.2)
        card = add_card(slide10, cx, cy, cw, ch, bg_color=SLATE_CARD, border_color=color)
        tfs = card.text_frame
        tfs.word_wrap = True
        p = tfs.paragraphs[0]
        p.text = title
        p.font.name = FONT_HEADING
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = color

        for name, sub in items:
            p_item = tfs.add_paragraph()
            p_item.text = f"• {name}"
            p_item.font.name = FONT_HEADING
            p_item.font.size = Pt(11.5)
            p_item.font.bold = True
            p_item.font.color.rgb = WHITE
            p_sub = tfs.add_paragraph()
            p_sub.text = f"   {sub}"
            p_sub.font.name = FONT_BODY
            p_sub.font.size = Pt(10)
            p_sub.font.color.rgb = LIGHT_TEXT

    # ==========================================
    # SLIDE 11 — ARCHITECTURE OVERVIEW
    # ==========================================
    slide11 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide11, SLATE_BG)
    add_base_decorations(slide11, 11, dark=False)

    tb = slide11.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "END-TO-END DATA FLOW"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = DEEP_BLUE

    p2 = tf.add_paragraph()
    p2.text = "System Architecture — 3-Zone Workspace Flow"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = NAVY

    # Diagram Row 1: Frontend
    c_fe = add_card(slide11, Inches(0.8), Inches(1.5), Inches(11.73), Inches(1.4), bg_color=WHITE, border_color=TEAL)
    tfe = c_fe.text_frame
    tfe.word_wrap = True
    p = tfe.paragraphs[0]
    p.text = "1. REACT 18 PWA CLIENT (PORT 5173)"
    p.font.name = FONT_HEADING
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p_desc = tfe.add_paragraph()
    p_desc.text = "3-Panel Layout: Sidebar (Location & Nav)  |  Main Working Area (Scenario Selector, WeatherCard, 6 Risk Gauges, Charts, Visual Guides)  |  Right Panel (AI Safety Chat, Alerts, 112 Speed Dial). Offline support via Service Worker & IndexedDB."
    p_desc.font.name = FONT_BODY
    p_desc.font.size = Pt(11.5)
    p_desc.font.color.rgb = DARK_TEXT

    # Diagram Row 2: FastAPI Backend
    c_be = add_card(slide11, Inches(0.8), Inches(3.1), Inches(11.73), Inches(1.55), bg_color=WHITE, border_color=AMBER)
    tfb = c_be.text_frame
    tfb.word_wrap = True
    p = tfb.paragraphs[0]
    p.text = "2. FASTAPI BACKEND & 14 ROUTERS (PORT 8000)"
    p.font.name = FONT_HEADING
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p_desc = tfb.add_paragraph()
    p_desc.text = "Routers: /api/weather • /api/risk • /api/safe-places • /api/helplines • /api/trusted-contacts • /api/alerts • /api/chat • /api/checklists • /api/auth • /api/profile • /api/notifications • /api/health (20+ REST Endpoints with Pydantic v2 schemas)."
    p_desc.font.name = FONT_BODY
    p_desc.font.size = Pt(11.5)
    p_desc.font.color.rgb = DARK_TEXT

    # Diagram Row 3: Intelligence & Data Layer
    c_dl = add_card(slide11, Inches(0.8), Inches(4.85), Inches(11.73), Inches(1.85), bg_color=WHITE, border_color=DEEP_BLUE)
    tfd = c_dl.text_frame
    tfd.word_wrap = True
    p = tfd.paragraphs[0]
    p.text = "3. AI AGENT, RAG VECTOR STORE & PERSISTENCE LAYER"
    p.font.name = FONT_HEADING
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = DEEP_BLUE
    p_desc = tfd.add_paragraph()
    p_desc.text = "• Gemini 2.0 Flash AI Agent with 7-language prompting\n• ChromaDB In-Process Vector Database with 12 NDMA/IMD official safety documents\n• SQLite Zero-Config Database with 11 relational tables (User, Location, RiskAssessment, Alert, SafePlace, Helpline, etc.)\n• External APIs: Open-Meteo (Weather), Nominatim (Geocoding), OSM Overpass (Emergency Facilities)"
    p_desc.font.name = FONT_BODY
    p_desc.font.size = Pt(11)
    p_desc.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 12 — DEMO SCENARIOS & TEST RESULTS
    # ==========================================
    slide12 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide12, SLATE_BG)
    add_base_decorations(slide12, 12, dark=False)

    tb = slide12.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "VERIFICATION & LIVE TESTING"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p2 = tf.add_paragraph()
    p2.text = "🎯 7 Interactive Climate Scenarios & Test Suite"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = NAVY

    scenarios = [
        ("🌊 Flood Simulator", "Score: 88/100 (Severe)", "62mm/hr rainfall, soil saturation 0.48, active flood warning"),
        ("🌡️ Heatwave Simulator", "Score: 92/100 (Severe)", "46.2°C ambient, 49°C feels-like, UV 11+, hydration alert"),
        ("🌀 Cyclone Simulator", "Score: 96/100 (Severe)", "115 km/h winds, 982 hPa pressure, coastal evacuation"),
        ("⚡ Lightning Simulator", "Score: 80/100 (Severe)", "WMO Code 99 violent thunderstorm, indoor shelter protocol"),
        ("🌾 Drought Simulator", "Score: 78/100 (Severe)", "0mm rain, 0.05 soil moisture, agricultural advisory"),
        ("🔥 Wildfire Simulator", "Score: 82/100 (Severe)", "38°C temp + 15% humidity + 32 km/h wind trigger"),
        ("🌤️ Normal Weather", "Score: 12/100 (Low)", "28°C pleasant conditions, routine readiness baseline"),
    ]

    for i, (title, score, desc) in enumerate(scenarios):
        col_idx = i % 4 if i < 4 else (i - 4) % 3
        row_idx = 0 if i < 4 else 1
        cw = Inches(2.8) if row_idx == 0 else Inches(3.75)
        cx = Inches(0.8 + col_idx * 2.98) if row_idx == 0 else Inches(0.8 + col_idx * 3.98)
        cy = Inches(1.5 + row_idx * 1.9)
        ch = Inches(1.7)
        card = add_card(slide12, cx, cy, cw, ch, bg_color=WHITE, border_color=TEAL if "Normal" in title else CORAL)
        tfc = card.text_frame
        tfc.word_wrap = True
        p = tfc.paragraphs[0]
        p.text = title
        p.font.name = FONT_HEADING
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = NAVY
        p_sc = tfc.add_paragraph()
        p_sc.text = score
        p_sc.font.name = FONT_BODY
        p_sc.font.size = Pt(11)
        p_sc.font.bold = True
        p_sc.font.color.rgb = CORAL if "Severe" in score else EMERALD
        p_de = tfc.add_paragraph()
        p_de.text = desc
        p_de.font.name = FONT_BODY
        p_de.font.size = Pt(9.5)
        p_de.font.color.rgb = GRAY_TEXT

    # Test Results Banner
    tb_test = add_card(slide12, Inches(0.8), Inches(5.6), Inches(11.73), Inches(1.2), bg_color=NAVY, border_color=EMERALD)
    tft = tb_test.text_frame
    tft.word_wrap = True
    p = tft.paragraphs[0]
    p.text = "🏆 AUTOMATED QA & VERIFICATION METRICS"
    p.font.name = FONT_HEADING
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p_res = tft.add_paragraph()
    p_res.text = "• 8/8 Backend Unit Tests PASSED (Pytest test_climate_system.py)\n• 732 Frontend Modules Built with ZERO Errors (Vite build in 786ms)\n• <1.0 Second End-to-End Multi-Hazard Risk Scoring & Safe Places Discovery"
    p_res.font.name = FONT_BODY
    p_res.font.size = Pt(11)
    p_res.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 13 — IMPACT & FUTURE ROADMAP
    # ==========================================
    slide13 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide13, NAVY)
    add_base_decorations(slide13, 13, dark=True)

    tb = slide13.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.9))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "SOCIAL IMPACT & FUTURE ROADMAP"
    p.font.name = FONT_HEADING
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = AMBER

    p2 = tf.add_paragraph()
    p2.text = "📈 Scalability, Beneficiaries & Roadmap"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = WHITE

    # Left: Impact Beneficiaries
    card_imp = add_card(slide13, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.2), bg_color=SLATE_CARD, border_color=TEAL)
    tfi = card_imp.text_frame
    tfi.word_wrap = True
    p = tfi.paragraphs[0]
    p.text = "Target Beneficiaries in India"
    p.font.name = FONT_HEADING
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = CYAN

    beneficiaries = [
        ("👨‍🌾 150M+ Farming Families", "Localized drought, frost & heatwave advisories for crop protection."),
        ("🏖️ 7,500 km Coastal Communities", "Early cyclone and storm-surge evacuation warnings in Telugu, Tamil & Malayalam."),
        ("🏘️ Peri-Urban & Slum Inhabitants", "Flash flood and waterlogging alerts before storm drains flood."),
        ("👴 Elderly & Priority Care Groups", "Direct emergency dispatch and family notification during temperature spikes."),
    ]
    for b_title, b_desc in beneficiaries:
        pb = tfi.add_paragraph()
        pb.text = f"• {b_title}"
        pb.font.name = FONT_HEADING
        pb.font.size = Pt(12)
        pb.font.bold = True
        pb.font.color.rgb = WHITE
        pbd = tfi.add_paragraph()
        pbd.text = f"   {b_desc}"
        pbd.font.name = FONT_BODY
        pbd.font.size = Pt(10.5)
        pbd.font.color.rgb = LIGHT_TEXT

    # Right: Technical Roadmap
    card_rd = add_card(slide13, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.2), bg_color=SLATE_CARD, border_color=AMBER)
    tfr = card_rd.text_frame
    tfr.word_wrap = True
    p = tfr.paragraphs[0]
    p.text = "2026–2027 Engineering Roadmap"
    p.font.name = FONT_HEADING
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = AMBER

    roadmap = [
        ("Q3 2026: Twilio WhatsApp Bot", "Citizens can query risks and receive severe alerts directly on WhatsApp without opening the app."),
        ("Q4 2026: Satellite AI Vision", "Integration of Sentinel-2 satellite imagery for AI-based flood inundation segmentation."),
        ("Q1 2027: CAP Integration", "Direct ingestion of NDMA Common Alerting Protocol (CAP) broadcast feeds."),
        ("Q2 2027: React Native App", "Native mobile build for Android & iOS with background GPS geofence alerts."),
    ]
    for r_title, r_desc in roadmap:
        pr = tfr.add_paragraph()
        pr.text = f"🚀 {r_title}"
        pr.font.name = FONT_HEADING
        pr.font.size = Pt(12)
        pr.font.bold = True
        pr.font.color.rgb = AMBER
        prd = tfr.add_paragraph()
        prd.text = f"   {r_desc}"
        prd.font.name = FONT_BODY
        prd.font.size = Pt(10.5)
        prd.font.color.rgb = LIGHT_TEXT

    # ==========================================
    # SLIDE 14 — THANK YOU / CLOSING SLIDE
    # ==========================================
    slide14 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide14, NAVY)

    glow14 = slide14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    glow14.fill.solid()
    glow14.fill.fore_color.rgb = DEEP_BLUE
    glow14.line.color.rgb = TEAL
    glow14.line.width = Pt(1.5)

    add_base_decorations(slide14, 14, dark=True)

    tb = slide14.shapes.add_textbox(Inches(1.2), Inches(1.4), Inches(10.8), Inches(2.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = "🌍 ClimateGuard AI"
    p.font.name = FONT_HEADING
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = WHITE

    p_sub = tf.add_paragraph()
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.text = "\"Protecting Every Life. In Every Language. At Every Location.\""
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(20)
    p_sub.font.bold = True
    p_sub.font.color.rgb = CYAN

    p_desc = tf.add_paragraph()
    p_desc.alignment = PP_ALIGN.CENTER
    p_desc.text = "A Multilingual, Location-Aware Climate Risk & Emergency Preparedness Platform"
    p_desc.font.name = FONT_BODY
    p_desc.font.size = Pt(14)
    p_desc.font.color.rgb = AMBER

    # 3 Summary Cards
    closing_items = [
        ("💻 Full Source Code", "Complete React 18 + FastAPI + SQLite Project Architecture", TEAL),
        ("🌐 Live Demo URLs", "Frontend: localhost:5173  |  Backend Docs: localhost:8000/docs", CYAN),
        ("🏆 Built For", "National Student Hackathon 2026 • AI For Social Good Track", EMERALD),
    ]
    for i, (title, desc, col) in enumerate(closing_items):
        cx = Inches(1.3 + i * 3.65)
        cy = Inches(4.0)
        cw = Inches(3.4)
        ch = Inches(1.8)
        card = add_card(slide14, cx, cy, cw, ch, bg_color=SLATE_CARD, border_color=col)
        tfc = card.text_frame
        tfc.word_wrap = True
        p = tfc.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = title
        p.font.name = FONT_HEADING
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = col
        p_body = tfc.add_paragraph()
        p_body.alignment = PP_ALIGN.CENTER
        p_body.text = desc
        p_body.font.name = FONT_BODY
        p_body.font.size = Pt(11)
        p_body.font.color.rgb = LIGHT_TEXT

    # Output file
    output_path = os.path.join(os.getcwd(), "ClimateGuard_AI_Presentation.pptx")
    prs.save(output_path)
    print(f"SUCCESS: Presentation saved to: {output_path}")

if __name__ == "__main__":
    create_presentation()
