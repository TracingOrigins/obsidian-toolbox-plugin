import {TFile} from 'obsidian';
import {AutoTimestampsTool} from '../core/AutoTimestampsTool';

/**
 * 处理文件打开事件
 * @param this 工具实例
 * @param file 打开的文件
 */
export async function handleFileOpen(this: AutoTimestampsTool, file: TFile | null): Promise<void> {
	if (!file || this.processingFile || this.isInitializing || await this.shouldIgnoreFile(file)) {
		return;
	}
	
	this.activeFile = file;
	await this.addTimestampsToFile(file);
}

/**
 * 处理文件创建事件
 * @param this 工具实例
 * @param file 创建的文件
 */
export async function handleFileCreate(this: AutoTimestampsTool, file: TFile): Promise<void> {
	if (this.processingFile || this.isInitializing || await this.shouldIgnoreFile(file)) {
		return;
	}
	
	await this.addTimestampsToFile(file);
}

/**
 * 处理文件修改事件
 * @param this 工具实例
 * @param file 修改的文件
 */
export async function handleFileModify(this: AutoTimestampsTool, file: TFile): Promise<void> {
	// 首先检查工具和功能是否启用
	if (!this.config.enabled || !this.config.enableModifiedTime) {
		return;
	}

	// 基本检查
	if (this.processingFile || this.isInitializing) {
		return;
	}

	// 获取当前活动文件
	const activeFile = this.plugin.app.workspace.getActiveFile();
	
	// 检查是否是有效的活动文件
	if (!activeFile || activeFile.extension !== 'md') {
		return;
	}

	// 检查是否是当前活动文件
	if (file !== activeFile) {
		return;
	}

	// 检查是否需要忽略该文件
	if (await this.shouldIgnoreFile(file)) {
		return;
	}

	const currentTime = Date.now();
	const interval = parseInt(String(this.config.modifyInterval)) * 1000;

	// 检查是否需要更新修改时间
	if (currentTime - this.lastModifiedTime > interval) {
		try {
			this.processingFile = true;
			
			// 使用文件的实际修改时间
			const modifiedTime = window.moment(file.stat.mtime).format(this.config.dateFormat);
			
			// 使用 Obsidian 的 fileManager 更新 frontmatter
			await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
				frontmatter.modified = modifiedTime;
			});
			
			this.lastModifiedTime = currentTime;
		} catch (error) {
			console.error(`[${this.id}] 更新修改时间时出错:`, error);
		} finally {
			this.processingFile = false;
		}
	}
} 
