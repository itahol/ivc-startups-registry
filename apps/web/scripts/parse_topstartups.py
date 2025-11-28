#!/usr/bin/env python3
import json
import re
from bs4 import BeautifulSoup

INPUT = 'topstartups.html'
OUT = 'topstartups_parsed_clean.json'

with open(INPUT, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
container = soup.find(id='box')
if not container:
    container = soup
cards = container.find_all('div', class_=lambda c: c and 'infinite-item' in c)

results = []
for card in cards:
    entry = {}
    # name
    h3 = card.find('h3')
    entry['company_name'] = h3.get_text(strip=True) if h3 else ''
    # website link: prefer anchor with id startup-website-link, else first link in header
    link_a = card.find('a', id='startup-website-link')
    if not link_a:
        # fallback: first anchor inside the right column
        link_a = card.select_one('.col-8 a') or card.find('a')
    entry['link'] = link_a.get('href') if link_a and link_a.get('href') else ''
    # raw html snippet
    entry['raw_html_snippet'] = str(card)

    # paragraphs
    paragraphs = card.find_all('p')
    entry['description_text'] = ''
    entry['industries'] = []
    entry['hq'] = ''
    entry['company_size'] = []
    entry['founded'] = ''
    entry['funding'] = []
    entry['founders_text'] = ''
    entry['social_links'] = []
    entry['jobs_link'] = ''

    for p in paragraphs:
        b = p.find('b')
        label = b.get_text(strip=True).lower() if b else ''
        text = p.get_text(separator=' ', strip=True)
        if 'what they do' in label:
            # remove "What they do:" prefix
            desc = re.sub(r'(?i)what they do:\s*', '', text).strip()
            entry['description_text'] = desc
            # industries badges
            industries = [s.get_text(strip=True) for s in p.find_all('span', id='industry-tags')]
            # filter empty
            entry['industries'] = [i for i in industries if i]
        elif 'quick facts' in label:
            # example text contains HQ: and badges for size/founded
            # extract HQ using HQ: or 📍HQ
            # removed unsupported \u{...} escape; use text-based fallback below
            # fallback: look for text lines containing 'HQ:'
            ptext = p.get_text('\n')
            hq = ''
            for line in ptext.split('\n'):
                if 'HQ:' in line or '📍HQ' in line:
                    hq = line.split('HQ:')[-1].strip()
                    break
            entry['hq'] = hq
            # company size and founded spans
            sizes = [s.get_text(strip=True) for s in p.find_all('span', id='company-size-tags')]
            entry['company_size'] = [s for s in sizes if s]
            # find founded token
            founded = ''
            for s in entry['company_size']:
                if 'Founded' in s:
                    founded = s
                    break
            # sometimes founded appears as separate span
            if not founded:
                for s in p.find_all('span', id='company-size-tags'):
                    txt = s.get_text(strip=True)
                    if 'Founded' in txt:
                        founded = txt
                        break
            entry['founded'] = founded
        elif 'funding' in label:
            funds = [s.get_text(strip=True) for s in p.find_all('span', id='funding-tags')]
            entry['funding'] = [f for f in funds if f]
        elif 'founders' in label:
            finders = re.sub(r'(?i)founders:\s*', '', text).strip()
            entry['founders_text'] = finders

    # social links
    social_as = card.find_all('a', id='social_media_link')
    entry['social_links'] = [a.get('href') for a in social_as if a.get('href')]
    # jobs link (button with id=view-jobs or anchor)
    jobs = card.find('a', id='view-jobs')
    if jobs and jobs.get('href'):
        entry['jobs_link'] = jobs.get('href')
    else:
        # fallback: anchor text "View Jobs" with button class
        a = card.find('a', string=re.compile(r'view jobs', re.I))
        if a and a.get('href'):
            entry['jobs_link'] = a.get('href')

    results.append(entry)

output = {
    'meta': {
        'source_file': INPUT,
        'total_cards_found': len(cards),
        'parsed': len(results),
    },
    'entries': results,
    'selectors': {
        'card_css': "div#box > div.infinite-item",
        'name_css': "h3",
        'website_css': "a#startup-website-link",
        'description_label': "p: b='What they do:'",
        'industries_span_id': "industry-tags",
        'company_size_span_id': "company-size-tags",
        'founded_hint': "text contains 'Founded' in company-size-tags",
        'funding_span_id': "funding-tags",
        'founders_label': "p: b='Founders:'",
        'social_link_id': "social_media_link",
        'jobs_link_id': "view-jobs",
    }
}

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f'Wrote {OUT} with {len(results)} entries')
