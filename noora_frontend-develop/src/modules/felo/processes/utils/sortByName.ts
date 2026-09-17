import { Process } from "../models";

export default function sortProcessesByName(processes: Process[]) {
  return processes.sort((a, b) => {
    var nameA = a.name.toUpperCase();
    var nameB = b.name.toUpperCase();
    return nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
  });
}
