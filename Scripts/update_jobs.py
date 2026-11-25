#!/usr/bin/env python3
"""Fetch public RSS/Atom recruitment feeds and merge new entries into jobs-data.js."""
import json
import os
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

# Add official / public RSS or Atom feed URLs here:
FEED_URLS = [
    "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
]

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOBS_JS_PATH = os.path.join(ROOT_DIR, "jobs-data.js")
SITEMAP_PATH = os.path.join(ROOT_DIR, "sitemap.xml")


def make_slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")


def infer_org(title: str) -> str:
    t = title.upper()
    for org in ["UPSC", "SSC", "RRB", "DRDO", "BARC", "ISRO", "IBPS", "SBI", "ONGC", "NTPC", "BHEL"]:
        if org in t:
            return org
    if "ARMY" in t:
        return "INDIAN ARMY"
    if "NAVY" in t:
        return "INDIAN NAVY"
    if "AIR FORCE" in t or "IAF" in t:
        return "INDIAN AIR FORCE"
    if "BANK" in t:
        return "BANKING"
    return "PSU"


def load_existing_jobs():
    with open(JOBS_JS_PATH, "r", encoding="utf-8") as f:
        raw = f.read()
    json_str = raw.split("window.JOBS_DATA = ", 1)[1].rsplit(";", 1)[0]
    return json.loads(json_str)


def save_jobs(jobs):
    with open(JOBS_JS_PATH, "w", encoding="utf-8") as f:
        f.write("// Central job listings dataset. Updated automatically or manually.\n")
        f.write("window.JOBS_DATA = ")
        json.dump(jobs, f, indent=2, ensure_ascii=False)
        f.write(";\n")


def parse_feed_xml(xml_bytes: bytes, source_url: str = ""):
    items = []
    root = ET.fromstring(xml_bytes)
    today_str = datetime.now().strftime("%b %d, %Y")

    # Support RSS <item> and Atom <entry>
    for node in root.findall(".//item") + root.findall(".//{http://www.w3.org/2005/Atom}entry"):
        def first_el(*tags):
            for tag in tags:
                el = node.find(tag)
                if el is not None:
                    return el
            return None

        title_el = first_el("title", "{http://www.w3.org/2005/Atom}title")
        link_el = first_el("link", "{http://www.w3.org/2005/Atom}link")
        desc_el = first_el(
            "description",
            "{http://www.w3.org/2005/Atom}summary",
            "{http://www.w3.org/2005/Atom}content",
        )
        title = (title_el.text or "").strip() if title_el is not None else ""
        if not title:
            continue
        link = ""
        if link_el is not None:
            link = (link_el.text or link_el.attrib.get("href", "")).strip()
        desc = re.sub(r"<[^>]+>", " ", (desc_el.text or "") if desc_el is not None else "").strip()
        desc = re.sub(r"\s+", " ", desc)[:260] or "Check the official notification for full eligibility and dates."

        items.append({
            "slug": make_slug(title),
            "title": title,
            "org": infer_org(title),
            "posts": 0,
            "qualification": "Graduation",
            "salary": "As per official norms",
            "location": "All India",
            "deadline": "Check Notice",
            "applyStart": today_str,
            "isNew": True,
            "applyLink": link or source_url,
            "fee": "Check official notification PDF",
            "selectionProcess": "Written Exam / CBT & Document Verification",
            "description": desc,
        })
    return items


def main():
    if not FEED_URLS:
        print("No FEED_URLS configured in scripts/update_jobs.py. Skipping fetch.")
        return

    existing = load_existing_jobs()
    existing_slugs = {j.get("slug") for j in existing if j.get("slug")}
    added = []

    for url in FEED_URLS:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "BharatJobAlert-Bot/1.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                xml_bytes = resp.read()
            for item in parse_feed_xml(xml_bytes, url):
                if item["slug"] and item["slug"] not in existing_slugs:
                    existing_slugs.add(item["slug"])
                    added.append(item)
        except Exception as exc:
            print(f"Warning: failed to fetch {url}: {exc}")

    if added:
        merged = added + existing
        save_jobs(merged)
        print(f"Added {len(added)} new job(s) to jobs-data.js.")
    else:
        print("No new jobs found.")


if __name__ == "__main__":
    main()
