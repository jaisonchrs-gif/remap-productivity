import { GoalCategory } from '../types/session';

export interface GoalCategoryOption {
  id: GoalCategory;
  label: string;
  shortLabel: string;
  emoji: string;
  taskPlaceholder: string;
  nextStepPlaceholder: string;
  taskStarters: string[];
  nextStepStarters: string[];
}

export const TASK_STARTERS = [
  'I want to study...',
  'I want to research...',
  'I want to call...',
  'I want to write...',
  'I want to plan...',
  'I want to fix...',
];

export const NEXT_STEP_STARTERS = [
  'First, open...',
  'First, read...',
  'First, write...',
  'First, call...',
  'First, check...',
  'First, outline...',
];

export const REMINDER_STARTERS = [
  'Left off at...',
  'Remember to check...',
  'File is saved in...',
  'Waiting on...',
];

export const GOAL_CATEGORIES: GoalCategoryOption[] = [
  {
    id: 'studies',
    label: 'Studies & Learning',
    shortLabel: 'Studies',
    emoji: '🎓',
    taskPlaceholder: 'e.g. I want to study... or I want to research...',
    nextStepPlaceholder: 'e.g. First, open lecture notes... or First, read page 10...',
    taskStarters: ['I want to study...', 'I want to research...', 'I want to solve...', 'I want to read...'],
    nextStepStarters: ['First, open notes...', 'First, read page...', 'First, solve question 1...'],
  },
  {
    id: 'business',
    label: 'Work & Projects',
    shortLabel: 'Work',
    emoji: '💼',
    taskPlaceholder: 'e.g. I want to prepare presentation... or I want to call...',
    nextStepPlaceholder: 'e.g. First, outline slide 1... or First, check emails from...',
    taskStarters: ['I want to write...', 'I want to call...', 'I want to review...', 'I want to plan...'],
    nextStepStarters: ['First, open file...', 'First, write 3 points...', 'First, send message to...'],
  },
  {
    id: 'personal',
    label: 'Personal & Habits',
    shortLabel: 'Personal',
    emoji: '🎯',
    taskPlaceholder: 'e.g. I want to plan workout... or I want to organize desk...',
    nextStepPlaceholder: 'e.g. First, clear table... or First, write list of 5 items...',
    taskStarters: ['I want to plan...', 'I want to organize...', 'I want to fix...', 'I want to learn...'],
    nextStepStarters: ['First, write 3 goals...', 'First, open app...', 'First, set up timer...'],
  },
  {
    id: 'financial',
    label: 'Finance & Planning',
    shortLabel: 'Finance',
    emoji: '💰',
    taskPlaceholder: 'e.g. I want to review expenses... or I want to pay bills...',
    nextStepPlaceholder: 'e.g. First, check bank app... or First, download statement...',
    taskStarters: ['I want to review...', 'I want to calculate...', 'I want to pay...', 'I want to check...'],
    nextStepStarters: ['First, log into bank...', 'First, check bills...', 'First, export transactions...'],
  },
  {
    id: 'creative',
    label: 'Creative & Writing',
    shortLabel: 'Creative',
    emoji: '🎨',
    taskPlaceholder: 'e.g. I want to write draft... or I want to sketch ideas...',
    nextStepPlaceholder: 'e.g. First, sketch 1 thumbnail... or First, write opening sentence...',
    taskStarters: ['I want to write...', 'I want to sketch...', 'I want to design...', 'I want to record...'],
    nextStepStarters: ['First, write title...', 'First, draw rough shape...', 'First, test audio mic...'],
  },
  {
    id: 'admin',
    label: 'Life Admin & Tasks',
    shortLabel: 'Life Admin',
    emoji: '🏡',
    taskPlaceholder: 'e.g. I want to call doctor... or I want to renew subscription...',
    nextStepPlaceholder: 'e.g. First, find phone number... or First, open website...',
    taskStarters: ['I want to call...', 'I want to book...', 'I want to renew...', 'I want to mail...'],
    nextStepStarters: ['First, look up number...', 'First, find account info...', 'First, check date...'],
  },
];
