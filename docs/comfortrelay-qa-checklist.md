# ComfortRelay Pre-Customer QA Checklist

Run with fictional data only. Do not use a real customer's live data until all required checks pass.

- [ ] QA-001 normal inquiry enters the workflow
- [ ] QA-002 urgent no-heat/no-cool inquiry is flagged correctly
- [ ] QA-003 malformed/missing-field inquiry is handled without silent failure
- [ ] QA-004 duplicate inquiry does not create unintended repeated outreach
- [ ] QA-005 Gmail action occurs as expected
- [ ] QA-006 Google Sheet state updates correctly
- [ ] QA-007 Telegram alert is generated where expected
- [ ] QA-008 simulated forwarding/notification failure follows escalation procedure
- [ ] QA-009 access removal is tested across Gmail / Sheets / Make / Telegram as applicable
- [ ] QA-010 export, correction, deletion/anonymization, and end-of-pilot shutdown are tested

For every test record:
- date
- reviewer
- expected result
- actual result
- PASS / FAIL
- exception
- remediation
- retest date

Do not activate a real customer workflow until failed tests are remediated and re-tested.
