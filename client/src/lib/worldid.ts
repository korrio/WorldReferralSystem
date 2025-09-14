import { IDKitWidget } from '@worldcoin/idkit';
import type { ISuccessResult } from '@worldcoin/idkit';

// World ID Configuration
// Note: You need to get these values from https://developer.worldcoin.org/
export const WORLD_ID_CONFIG = {
  app_id: import.meta.env.VITE_WORLD_ID_APP_ID || 'app_staging_7dd00a92b79e4165684dcf3c65d474a9', // Replace with your app_id
  action: 'login', // This should match your action in Developer Portal
  verification_level: 'device' as const, // Use 'device' for staging compatibility
  signal: '', // Empty signal for basic authentication
};

export interface WorldIDUser {
  verified: boolean;
  nullifier_hash: string;
  verification_level: string;
  merkle_root: string;
  proof: string;
  credential_type: string;
}

// Verify World ID proof on the server
export const verifyWorldIDProof = async (proof: ISuccessResult): Promise<WorldIDUser> => {
  try {
    const response = await fetch('/api/verify-world-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proof: proof.proof,
        merkle_root: proof.merkle_root,
        nullifier_hash: proof.nullifier_hash,
        verification_level: proof.verification_level,
        credential_type: proof.credential_type,
        action: WORLD_ID_CONFIG.action,
        signal: '', // Can be used for additional data
      }),
    });

    if (!response.ok) {
      throw new Error('World ID verification failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('World ID verification error:', error);
    throw error;
  }
};

// World ID success callback
export const handleWorldIDSuccess = async (
  proof: ISuccessResult,
  onSuccess?: (user: WorldIDUser) => void,
  onError?: (error: Error) => void
) => {
  try {
    const user = await verifyWorldIDProof(proof);
    onSuccess?.(user);
  } catch (error) {
    onError?.(error as Error);
  }
};

// World ID error callback
export const handleWorldIDError = (error: any, onError?: (error: Error) => void) => {
  console.error('World ID error:', error);
  onError?.(new Error(error.message || 'World ID verification failed'));
};