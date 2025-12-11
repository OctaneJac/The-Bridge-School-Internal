import { sql } from "@/lib/db";

export interface Branch {
  id: number;
  name: string;
  address: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get branch by branch ID
 */
export async function getBranchById(branchId: number): Promise<Branch | null> {
  const result = await sql`
    SELECT 
      id,
      name,
      address,
      created_at,
      updated_at
    FROM branches
    WHERE id = ${branchId}
    LIMIT 1
  `;

  return (result[0] as unknown as Branch) || null;
}

/**
 * Get all branches
 */
export async function getAllBranches(): Promise<Branch[]> {
  const result = await sql`
    SELECT 
      id,
      name,
      address,
      created_at,
      updated_at
    FROM branches
    ORDER BY id ASC
  `;

  return Array.from(result) as Branch[];
}
