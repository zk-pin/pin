export type CommitmentPoolProps = {
    id: string;
    title: string;
    created_at: string;
    operatorId: string | number;
    description?: string;
    threshold: number;
    signatures: any[];
    revealed_keys: any[];
};

export type KeyPair = {
    privateKey?: string;
    publicKey?: string;
};
