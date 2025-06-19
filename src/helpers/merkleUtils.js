import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { ethers } from 'ethers';


function createLeaf(diploma) {
    const packedData = ethers.utils.solidityPack(
        ['string', 'string', 'string', 'string', 'string'],
        [
            diploma.fullName,
            diploma.studentId,
            diploma.degree,
            diploma.speciality,
            diploma.academicFullYear
        ]
    );
    return keccak256(packedData);
}

export function buildMerkleTree(diplomas) {
    if (!Array.isArray(diplomas) || diplomas.length === 0) {
        throw new Error("Cannot build Merkle tree from empty or invalid data.");
    }

    const leaves = diplomas.map(createLeaf);
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const merkleRoot = '0x' + merkleTree.getRoot().toString('hex');

    return { merkleTree, merkleRoot, leaves };
}


export function downloadJson(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
