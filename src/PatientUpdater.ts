export type Patient = {
  id: number;
  temperature: number;
  lastUpdated: number;
};

const NORMAL_TEMPERATURE = 37;

export type PatientUpdateAction = (patient: Patient) => Promise<Patient>;

export type PatientUpdateProps = {
  action: PatientUpdateAction;
  howManyToUpdate: number;
};

export class PatientUpdater {
  patients: Patient[];
  numberOfPatients: number;

  constructor(numberOfPatients: number) {
    const lastUpdated = Math.round(Date.now() / 1000);
    this.numberOfPatients = numberOfPatients;
    this.patients = new Array(this.numberOfPatients)
      .fill(undefined)
      .map((_, id) => {
        return {
          id,
          lastUpdated,
          temperature: NORMAL_TEMPERATURE,
        };
      });
  }

  getRandomNumber = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  getRandomNumbers(amount: number) {
    const numbers = new Set<number>();
    while (numbers.size < amount) {
      numbers.add(this.getRandomNumber(0, this.numberOfPatients - 1));
    }
    return numbers.values();
  }

  async update({
    action,
    howManyToUpdate = this.numberOfPatients / 2,
  }: PatientUpdateProps) {
    const playerIdsToUpdate: number[] = Array.from(
      this.getRandomNumbers(howManyToUpdate)
    );
    const playersToUpdate = playerIdsToUpdate.map((id) => {
      const newState: Patient = {
        ...this.patients[id],
        temperature: this.getRandomNumber(35, 39),
        lastUpdated: Math.round(Date.now() / 1000),
      };
      this.patients[id] = newState;
      return newState;
    });

    const invocations = playersToUpdate.map(action);
    return Promise.all(invocations);
  }
}
