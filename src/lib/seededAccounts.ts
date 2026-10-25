export type SeededAccount = {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  displayName: string;
};

export const SEEDED_ADMIN_ACCOUNT: SeededAccount = {
  id: 'admin-001',
  username: 'admin',
  password: 'admin@123',
  role: 'admin',
  displayName: '管理员账号',
};

export const SEEDED_USER_ACCOUNTS: SeededAccount[] = Array.from({ length: 10 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  return {
    id: `student-${number}`,
    username: `user${number}`,
    password: 'user123456',
    role: 'user',
    displayName: `学员 ${number}`,
  };
});

export const SEEDED_ACCOUNTS: SeededAccount[] = [
  SEEDED_ADMIN_ACCOUNT,
  ...SEEDED_USER_ACCOUNTS,
];
