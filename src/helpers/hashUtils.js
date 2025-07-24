import { ethers } from "ethers";

export function generateDiplomaHash(diplomaData) {
  const { fullName, degree, specialty, mention, idNumber, academicYear, juryMeetingDate } = diplomaData;

  const diplomaHash = ethers.utils.solidityKeccak256(
    ['string', 'string', 'string', 'string', 'string', 'string', 'string'],
    [fullName, degree, specialty, mention, idNumber, academicYear, juryMeetingDate]
  );

  return diplomaHash;
}