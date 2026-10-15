# Event Ops Systems Sprint — delivery blueprint

This is a private delivery asset. It is not a generic Airtable template and has not been sent, uploaded, or published.

## Outcome

Turn one repeated event-operations workflow into a working, testable system that the client's operator can maintain. The sprint succeeds only when one real workflow can move from intake to completion without duplicate entry, an unclear owner, or an invisible handoff.

## Fixed boundary

- One workflow with one accountable business owner
- Up to five connected tables
- Up to two native Airtable automations
- One operator interface
- One import of cleaned sample data supplied by the client
- Acceptance tests, operating notes, and a 45-minute handoff
- No custom API integrations, historical migration, public portal, regulated data, or organization-wide replacement

Anything outside that boundary becomes a separate estimate after the pilot is accepted.

## Discovery record

Capture these facts before designing fields:

1. Trigger: what starts the workflow?
2. Finish: what observable result means the work is complete?
3. Owner: who is accountable when a record stalls?
4. Participants: who creates, changes, approves, or consumes information?
5. Current systems: where does each fact originate and where is it copied?
6. Volume: how many events, records, changes, and exceptions occur each month?
7. Failure: what gets missed, duplicated, delayed, or disputed?
8. Exceptions: which real cases cannot follow the normal path?
9. Access: what must each role see or edit?
10. Success metric: which single number should improve first?

## Reference data model

Use only the records needed by the chosen workflow. A common starting pattern is:

| Table | Purpose | Required keys |
|---|---|---|
| Events | Source of truth for the job, date, venue, owner, and status | Event ID, name, start, venue, owner, status |
| People or Organizations | Speakers, clients, vendors, crew, or partners involved | Contact ID, name, role, organization, contact channel |
| Deliverables | Concrete work promised for an event | Deliverable ID, event, owner, due date, status |
| Changes or Requests | Incoming changes that require a decision or downstream update | Request ID, event, source, received time, decision, owner |
| Activity or Handoffs | Auditable record of what moved, when, and to whom | Activity ID, linked record, action, actor, timestamp |

Delete unused tables. Add a new table only when the records have their own lifecycle, owner, or many-to-many relationship.

## Automation rules

Automation one should move information, not make an unowned business decision. Typical example: when an approved change is recorded, create the required downstream deliverables and assign their owners.

Automation two should surface failure. Typical example: notify the workflow owner when a required deliverable is still open inside an agreed deadline.

Every automation must expose its trigger, conditions, resulting change, owner, failure path, and test record. Failed runs count as operational work and cannot disappear silently.

## Acceptance tests

The client chooses representative records. At minimum, verify:

- A valid intake creates one complete record and no duplicate.
- The assigned operator sees only the fields needed for the next decision.
- A normal status change produces the expected downstream work exactly once.
- An incomplete record does not trigger an unsafe action.
- A late item becomes visible to the accountable owner.
- A corrected event detail appears everywhere that uses the linked source record.
- A user can find the current status without opening a spreadsheet export or asking the builder.
- The client owner can explain how to add a field, disable an automation, and investigate a failed run.

## Handoff package

- One-page workflow map
- Data dictionary for required fields
- Automation register with owner and failure behavior
- Acceptance-test results
- Known limitations and deferred decisions
- Maintenance checklist for the business owner

## Commercial proof required

This blueprint reduces delivery risk; it does not prove demand. The offer still advances only after ten qualified exposures produce at least two discovery calls or one paid deposit. Cheap marketplace builds make process diagnosis, adoption, testing, and client self-sufficiency the paid differentiation.
