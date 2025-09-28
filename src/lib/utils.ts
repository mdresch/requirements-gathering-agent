import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return targetDate.toLocaleDateString();
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

export function validateTemplate(template: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }
  
  if (!template.content || template.content.trim().length === 0) {
    errors.push('Template content is required');
  }
  
  if (!template.category || template.category.trim().length === 0) {
    errors.push('Template category is required');
  }
  
  // Validate document key format
  if (!template.documentKey || template.documentKey.trim().length === 0) {
    errors.push('Document key is required');
  } else if (template.documentKey === 'Document ID') {
    errors.push('Document key cannot be "Document ID". Please use a proper processor identification key (e.g., "business-case")');
  } else if (!/^[a-z0-9-]+$/.test(template.documentKey)) {
    errors.push('Document key must be lowercase with hyphens only (e.g., "business-case")');
  }
  
  // Check for framework in metadata - make it optional with default
  if (template.metadata?.framework && template.metadata.framework.trim().length === 0) {
    errors.push('Framework cannot be empty if provided');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}