import {TFile, TFolder} from 'obsidian';
import {AutoTimestampsTool} from '../core/AutoTimestampsTool';

/**
 * 从文件中提取标签
 * @param this 工具实例
 * @param file 要检查的文件
 * @returns 标签列表
 */
export function extractTags(this: AutoTimestampsTool, file: TFile): string[] {
	const tags: string[] = [];
	const metadata = this.plugin.app.metadataCache.getFileCache(file);
	
	// 从 frontmatter 中提取标签
	if (metadata?.frontmatter?.tags) {
		const frontmatterTags = Array.isArray(metadata.frontmatter.tags) 
			? metadata.frontmatter.tags 
			: [metadata.frontmatter.tags];
		frontmatterTags.forEach((tag: string) => {
			const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
			tags.push(formattedTag);
		});
	}

	// 从文档内容中提取标签
	if (metadata?.tags) {
		metadata.tags.forEach((tag: { tag: string }) => {
			tags.push(tag.tag);
		});
	}

	return [...new Set(tags)]; // 去重
}

/**
 * 检查文件是否应该被忽略
 * @param this 工具实例
 * @param file 要检查的文件
 * @returns 如果文件应该被忽略则返回true
 */
export async function shouldIgnoreFile(this: AutoTimestampsTool, file: TFile): Promise<boolean> {
	const config = this.config;
	const filePath = file.path;
	
	// 检查是否是目录
	if (file instanceof TFolder) {
		return true;
	}
	
	// 检查文件夹匹配
	const ignoredFolders = config.ignoredFolders.split('\n').filter((f: string) => f.trim());
	for (const folderPattern of ignoredFolders) {
		if (matchesPattern(filePath, folderPattern)) {
			return true;
		}
	}
	
	// 检查文件匹配
	const ignoredFiles = config.ignoredFiles.split('\n').filter((f: string) => f.trim());
	for (const filePattern of ignoredFiles) {
		if (matchesPattern(filePath, filePattern)) {
			return true;
		}
	}

	// 检查标签匹配
	const ignoredTags = config.ignoredTags.split('\n').filter((t: string) => t.trim());
	if (ignoredTags.length > 0) {
		try {
			const tags = extractTags.call(this, file);
			
			// 检查每个标签是否匹配任何忽略模式
			for (const tag of tags) {
				for (const tagPattern of ignoredTags) {
					// 移除标签中的 # 符号进行比较
					const cleanTag = tag.substring(1);
					const cleanPattern = tagPattern.startsWith('#') ? tagPattern.substring(1) : tagPattern;
					
					if (matchesPattern(cleanTag, cleanPattern)) {
						console.log(`[${this.id}] 忽略文件 ${filePath}，匹配标签 ${tag}`);
						return true;
					}
				}
			}
		} catch (error) {
			console.error(`[${this.id}] 检查标签时出错:`, error);
		}
	}
	
	return false;
}

/**
 * 检查路径是否匹配给定的模式
 * @param path 要检查的路径
 * @param pattern 匹配模式（支持通配符）
 * @returns 如果匹配则返回true
 */
export function matchesPattern(path: string, pattern: string): boolean {
	// 将通配符转换为正则表达式
	const regexPattern = pattern
		.replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
		.replace(/\*/g, '.*') // 将 * 转换为 .*
		.replace(/\?/g, '.'); // 将 ? 转换为 .
	
	const regex = new RegExp(`^${regexPattern}$`);
	return regex.test(path);
} 
