import { ethers } from "ethers";

export function generateDiplomaHash(diplomaData) {
  const { fullName, degree, academicFullYear } = diplomaData;

  const hash = ethers.utils.solidityKeccak256(
    ["string", "string", "string"],
    [fullName, degree, academicFullYear]
  );

  return hash;
}