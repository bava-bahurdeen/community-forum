export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'MODERATOR';
  enrolledCourses: string[];
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'alice-id-1111-1111',
    name: 'Alice',
    email: 'alice@student.edu',
    role: 'STUDENT',
    enrolledCourses: ['cs101'],
  },
  {
    id: 'bob-id-2222-2222',
    name: 'Bob',
    email: 'bob@student.edu',
    role: 'STUDENT',
    enrolledCourses: ['cs202'],
  },
  {
    id: 'charlie-id-3333-3333',
    name: 'Charlie',
    email: 'charlie@student.edu',
    role: 'STUDENT',
    enrolledCourses: ['cs101', 'cs202'],
  },
  {
    id: 'eve-id-4444-4444',
    name: 'Eve (No Courses)',
    email: 'eve@student.edu',
    role: 'STUDENT',
    enrolledCourses: [],
  },
  {
    id: 'david-id-5555-5555',
    name: 'David (Moderator)',
    email: 'david@moderator.edu',
    role: 'MODERATOR',
    enrolledCourses: [], // Moderators can access all courses
  },
];
