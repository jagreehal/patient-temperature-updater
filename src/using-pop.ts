import { Patient, PatientUpdater } from './PatientUpdater';
import { createClient } from 'redis';

const client = createClient({
  url: `redis://localhost:6379`,
});
const worker_client = createClient({
  url: `redis://localhost:6379`,
});

const PATIENT_SORTED_SET = 'PATIENT_SORTED_SET';

const action = async (patient: Patient) => {
  const existingEntry = await client.zScore(
    PATIENT_SORTED_SET,
    patient.id.toString()
  );
  if (!existingEntry) {
    client.zAdd(PATIENT_SORTED_SET, {
      score: patient.lastUpdated,
      value: patient.id.toString(),
    });
  }
  console.log('updated', patient.id, patient.temperature);
  client.set(patient.id.toString(), JSON.stringify({ patient }));
  return patient;
};

async function processPatient(id: string) {
  const patient = await worker_client.get(id);
  console.log('processed', patient);
}

const worker = async (batchSize: number) => {
  const queue = await worker_client.zRange(PATIENT_SORTED_SET, 0, -1);
  console.log(`Queue length: ${queue.length}`, queue);
  const patientIdsToProcess = await worker_client.zPopMinCount(
    PATIENT_SORTED_SET,
    batchSize
  );
  console.log('patientIdsToProcess', patientIdsToProcess);

  await Promise.all(
    (Array.isArray(patientIdsToProcess)
      ? patientIdsToProcess
      : [patientIdsToProcess]
    ).map((patient) => processPatient(patient.value))
  );
};

async function run() {
  const runner = new PatientUpdater(10);

  // clean up existing data in sorted set
  await client.connect();
  await client.del(PATIENT_SORTED_SET);
  await client.quit();

  // start worker
  setInterval(async () => {
    await worker_client.connect();
    await worker(2);
    await worker_client.quit();
  }, 1000);

  // start updater
  setInterval(async () => {
    await client.connect();
    await runner.update({
      action,
      howManyToUpdate: 5,
    });
    await client.quit();
  }, 1000);
}

run();
