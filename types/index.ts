// Window 相關類型
export type WindowName = 
  | 'artlier' 
  | 'walrusupload' 
  | 'walrusview'

// Artlier 相關類型
export interface Artlier {
  name: string;
  blobId: string;
  objectId: string;
}