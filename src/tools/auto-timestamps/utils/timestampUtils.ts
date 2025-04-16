import {TFile} from 'obsidian';
import {AutoTimestampsTool} from '../core/AutoTimestampsTool';

/**
 * 添加时间戳到文件
 * @param this 工具实例
 * @param file 要处理的文件
 */
export async function addTimestampsToFile(this: AutoTimestampsTool, file: TFile): Promise<void> {
	if (!file || file.extension !== 'md' || await this.shouldIgnoreFile(file)) {
		return;
	}

	try {
		this.processingFile = true;
		const metadata = this.plugin.app.metadataCache.getFileCache(file);
		let dataToAdd: Record<string, string> = {};
		let needsUpdate = false;

		// 检查创建时间
		if (this.config.enableCreatedTime && !metadata?.frontmatter?.created) {
			// 获取文件的实际创建时间
			dataToAdd.created = window.moment(file.stat.ctime).format(this.config.dateFormat);
			needsUpdate = true;
		}

		// 检查修改时间
		if (this.config.enableModifiedTime && !metadata?.frontmatter?.modified) {
			// 获取文件的实际修改时间
			dataToAdd.modified = window.moment(file.stat.mtime).format(this.config.dateFormat);
			needsUpdate = true;
		}

		// 如果需要更新，一次性添加所有缺失的时间属性
		if (needsUpdate) {
			await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
				for (const key in dataToAdd) {
					frontmatter[key] = dataToAdd[key];
				}
			});
		}
	} catch (error) {
		console.error(`[${this.id}] 添加时间戳时出错:`, error);
	} finally {
		this.processingFile = false;
	}
}

/**
 * 检查文件是否包含指定的时间属性
 * @param file 要检查的文件
 * @param property 要检查的属性
 * @returns 是否包含该属性
 */
export function hasTimeProperty(file: TFile, property: string): boolean {
	const metadata = this.plugin.app.metadataCache.getFileCache(file);
	return metadata?.frontmatter?.[property] !== undefined;
}

/**
 * 在文档中插入或更新frontmatter
 * @param content 文件内容
 * @param data 要添加的数据
 * @returns 更新后的内容
 */
export function insertFrontMatter(content: string, data: Record<string, string>): string {
	const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
	let frontMatter = content.match(frontMatterRegex)?.[1] || '';
	let newFrontMatter = frontMatter;

	// 更新或添加时间戳
	for (const key in data) {
		const value = data[key];
		const regex = new RegExp(`^${key}:.*$`, 'm');
		if (regex.test(frontMatter)) {
			newFrontMatter = newFrontMatter.replace(regex, `${key}: ${value}`);
		} else {
			newFrontMatter += `\n${key}: ${value}`;
		}
	}

	// 返回更新后的内容
	if (frontMatter) {
		return content.replace(frontMatterRegex, `---\n${newFrontMatter.trim()}\n---`);
	} else {
		return `---\n${newFrontMatter.trim()}\n---\n\n${content}`;
	}
} 
