import { ethers } from "ethers";

export function generateDiplomaHash(diplomaData) {
  const { fullName, degree, academicYear, idNumber } = diplomaData;

  const hash = ethers.utils.solidityKeccak256(
    ["string", "string", "string", "string"],
    [fullName, degree, academicYear, idNumber]
  );

  return hash;
}