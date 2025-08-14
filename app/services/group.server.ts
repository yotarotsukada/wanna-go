// 新しいfeature-based serviceへの薄いファサード
export {
  createGroup,
  getGroup,
  updateGroup,
  generateGroupId
} from './group';

// 後方互換性のための旧関数名
export { generateGroupId as generateUniqueGroupId } from './group';