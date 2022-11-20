# Patient Temperature Updater

This is an example of updating patient temperatures in micro-batches.

Patient entries are kept in the order they are received, but the data is for the latest temperature reading.

So when the entry is _pulled_ it will contain the latest temperature reading for the patient.

## Setup

```bash
pnpm install
docker-compose up -d
pnpm start
```
