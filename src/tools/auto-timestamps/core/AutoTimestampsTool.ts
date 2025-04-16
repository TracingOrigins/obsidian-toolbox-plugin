import {TFile, Notice} from 'obsidian';
import {BaseTool} from '../../../core/base/BaseTool';
import ToolboxPlugin from "../../../main";
import {AutoTimestampsConfig} from '../types/types';
import {registerToolCommands} from '../commands/toolCommands';
import {handleFileOpen, handleFileCreate, handleFileModify} from '../handlers/fileEventHandlers';
import {addTimestampsToFile, hasTimeProperty, insertFrontMatter} from '../utils/timestampUtils';
import {shouldIgnoreFile, extractTags, matchesPattern} from '../utils/fileUtils';
import {displayAutoTimestampsSettings} from './AutoTimestampsSettings';

/**
 * 自动时间戳工具类
 * 为Obsidian笔记自动添加和更新创建时间和修改时间
 */
export class AutoTimestampsTool extends BaseTool<AutoTimestampsConfig> {
	/**
	 * 工具唯一ID
	 */
	id = 'auto-timestamps';
	/**
	 * 工具显示名称
	 */
	name = '自动时间戳';
	/**
	 * 工具描述
	 */
	description = '自动为文档添加创建时间和修改时间的时间戳';

	/**
	 * 上次修改时间（毫秒时间戳）
	 * 用于控制更新频率
	 */
	lastModifiedTime: number = 0;
	/**
	 * 当前活动文件
	 */
	activeFile: TFile | null = null;
	/**
	 * 标记是否正在处理文件
	 * 避免重复处理和无限循环
	 */
	processingFile: boolean = false;
	/**
	 * 标记工具是否正在初始化
	 * 避免初始化阶段触发不必要的时间戳更新
	 */
	isInitializing: boolean = true;
	// isInitializing: boolean = false;

	// 事件处理函数绑定
	/**
	 * 文件打开事件处理函数（绑定this上下文）
	 */
	private boundFileOpenHandler: (file: TFile | null) => Promise<void>;
	/**
	 * 文件创建事件处理函数（绑定this上下文）
	 */
	private boundFileCreateHandler: (file: TFile) => Promise<void>;
	/**
	 * 文件修改事件处理函数（绑定this上下文）
	 */
	private boundFileModifyHandler: (file: TFile) => Promise<void>;

	/**
	 * 构造函数
	 * @param plugin 插件实例引用
	 */
	constructor(plugin: ToolboxPlugin) {
		super(plugin);

		// 绑定事件处理函数
		this.boundFileOpenHandler = handleFileOpen.bind(this);
		this.boundFileCreateHandler = handleFileCreate.bind(this);
		this.boundFileModifyHandler = handleFileModify.bind(this);

		// 初始化后延迟清除初始化标志
		setTimeout(() => {
			this.isInitializing = false;
		}, 2000);
	}

	/**
	 * 注册工具命令
	 * 在Obsidian命令面板中添加相关命令
	 */
	private registerToolCommands(): void {
		registerToolCommands(this);
	}

	/**
	 * 启用工具
	 * 注册事件监听器和命令
	 */
	enable(): void {
		// 注册所有事件监听器
		this.plugin.app.workspace.on('file-open', this.boundFileOpenHandler);
		this.plugin.app.vault.on('create', this.boundFileCreateHandler);
		this.plugin.app.vault.on('modify', this.boundFileModifyHandler);

		// 注册工具命令
		this.registerToolCommands();
	}

	/**
	 * 禁用工具
	 * 移除事件监听器和命令
	 */
	disable(): void {
		// 移除所有事件监听器
		this.plugin.app.workspace.off('file-open', this.boundFileOpenHandler);
		this.plugin.app.vault.off('create', this.boundFileCreateHandler);
		this.plugin.app.vault.off('modify', this.boundFileModifyHandler);

		// 注销工具命令
		(this.plugin.toolManager as any).unregisterToolCommands(this.id);
	}

	getDefaultConfig(): AutoTimestampsConfig {
		return {
			enabled: false,
			dateFormat: 'YYYY-MM-DD HH:mm:ss',
			enableCreatedTime: true,
			enableModifiedTime: true,
			modifyInterval: 10,
			ignoredFolders: '',
			ignoredFiles: '',
			ignoredTags: '',
			useFileCreationDate: true,
			useFileModificationDate: true
		};
	}

	validateConfig(config: AutoTimestampsConfig): boolean {
		// 确保modifyInterval是数字或可转换为有效数字的字符串
		let validModifyInterval = false;
		if (typeof config.modifyInterval === 'number') {
			validModifyInterval = config.modifyInterval > 0;
		} else if (typeof config.modifyInterval === 'string') {
			const num = parseInt(config.modifyInterval);
			validModifyInterval = !isNaN(num) && num > 0;
		}

		return (
			typeof config.enabled === 'boolean' &&
			typeof config.dateFormat === 'string' &&
			typeof config.enableCreatedTime === 'boolean' &&
			typeof config.enableModifiedTime === 'boolean' &&
			validModifyInterval &&
			typeof config.useFileCreationDate === 'boolean' &&
			typeof config.useFileModificationDate === 'boolean'
		);
	}

	displaySettings(containerEl: HTMLElement): void {
		displayAutoTimestampsSettings(containerEl, this.plugin, this);
	}

	/**
	 * 获取工具详细信息
	 */
	get details(): string {
		return this.description;
	}

	// 配置变更处理
	onConfigChange(config: AutoTimestampsConfig): void {
		// 调用父类方法处理启用/禁用
		super.onConfigChange(config);

		// 如果工具被启用，重新注册命令
		if (config.enabled) {
			this.registerToolCommands();
		} else {
			// 如果工具被禁用，注销命令
			(this.plugin.toolManager as any).unregisterToolCommands(this.id);
		}
	}

	/**
	 * 添加时间戳到文件
	 * @param file 要处理的文件
	 */
	async addTimestampsToFile(file: TFile): Promise<void> {
		return addTimestampsToFile.call(this, file);
	}

	/**
	 * 检查文件是否应该被忽略
	 * @param file 要检查的文件
	 */
	async shouldIgnoreFile(file: TFile): Promise<boolean> {
		return shouldIgnoreFile.call(this, file);
	}

	/**
	 * 在文档中插入或更新frontmatter
	 * @param content 文件内容
	 * @param data 要添加的数据
	 */
	insertFrontMatter(content: string, data: Record<string, string>): string {
		return insertFrontMatter(content, data);
	}

	/**
	 * 批量为所有Markdown文件添加创建时间
	 */
	async addCreatedTimeToAllFiles(): Promise<void> {
		if (!this.config.enabled || !this.config.enableCreatedTime) {
			return;
		}

		this.processingFile = true;
		let count = 0;
		try {
			// 获取所有Markdown文件
			const files = this.plugin.app.vault.getMarkdownFiles();
			
			// 进度通知
			const notice = new Notice(`正在批量添加创建时间... (0/${files.length})`, 0);
			
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				
				// 更新进度通知
				notice.setMessage(`正在批量添加创建时间... (${i+1}/${files.length})`);
				
				// 跳过需要被忽略的文件
				if (await this.shouldIgnoreFile(file)) {
					continue;
				}
				
				const metadata = this.plugin.app.metadataCache.getFileCache(file);
				
				// 如果文件没有创建时间属性，添加它
				if (!metadata?.frontmatter?.created) {
					await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
						// 使用文件创建时间或当前时间
						const createdTime = this.config.useFileCreationDate 
							? window.moment(file.stat.ctime).format(this.config.dateFormat)
							: window.moment().format(this.config.dateFormat);
						
						frontmatter['created'] = createdTime;
					});
					count++;
				}
			}
			
			// 关闭进度通知
			notice.hide();
			
			// 成功通知
			new Notice(`成功为 ${count} 个文件添加创建时间`);
		} catch (error) {
			console.error(`[${this.id}] 批量添加创建时间时出错:`, error);
			new Notice(`批量添加创建时间时出错: ${error.message}`);
		} finally {
			this.processingFile = false;
		}
	}
	
	/**
	 * 批量为所有Markdown文件添加修改时间
	 */
	async addModifiedTimeToAllFiles(): Promise<void> {
		if (!this.config.enabled || !this.config.enableModifiedTime) {
			return;
		}

		this.processingFile = true;
		let count = 0;
		try {
			// 获取所有Markdown文件
			const files = this.plugin.app.vault.getMarkdownFiles();
			
			// 进度通知
			const notice = new Notice(`正在批量添加修改时间... (0/${files.length})`, 0);
			
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				
				// 更新进度通知
				notice.setMessage(`正在批量添加修改时间... (${i+1}/${files.length})`);
				
				// 跳过需要被忽略的文件
				if (await this.shouldIgnoreFile(file)) {
					continue;
				}
				
				const metadata = this.plugin.app.metadataCache.getFileCache(file);
				
				// 如果文件没有修改时间属性，添加它
				if (!metadata?.frontmatter?.modified) {
					await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
						// 使用文件修改时间或当前时间
						const modifiedTime = this.config.useFileModificationDate 
							? window.moment(file.stat.mtime).format(this.config.dateFormat)
							: window.moment().format(this.config.dateFormat);
						
						frontmatter['modified'] = modifiedTime;
					});
					count++;
				}
			}
			
			// 关闭进度通知
			notice.hide();
			
			// 成功通知
			new Notice(`成功为 ${count} 个文件添加修改时间`);
		} catch (error) {
			console.error(`[${this.id}] 批量添加修改时间时出错:`, error);
			new Notice(`批量添加修改时间时出错: ${error.message}`);
		} finally {
			this.processingFile = false;
		}
	}
	
	/**
	 * 批量为所有Markdown文件添加时间戳（创建时间和修改时间）
	 */
	async addTimestampsToAllFiles(): Promise<void> {
		if (!this.config.enabled) {
			return;
		}

		this.processingFile = true;
		let createdCount = 0;
		let modifiedCount = 0;
		try {
			// 获取所有Markdown文件
			const files = this.plugin.app.vault.getMarkdownFiles();
			
			// 进度通知
			const notice = new Notice(`正在批量添加时间戳... (0/${files.length})`, 0);
			
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				
				// 更新进度通知
				notice.setMessage(`正在批量添加时间戳... (${i+1}/${files.length})`);
				
				// 跳过需要被忽略的文件
				if (await this.shouldIgnoreFile(file)) {
					continue;
				}
				
				const metadata = this.plugin.app.metadataCache.getFileCache(file);
				let dataToAdd: Record<string, string> = {};
				let needsUpdate = false;
				
				// 检查创建时间
				if (this.config.enableCreatedTime && !metadata?.frontmatter?.created) {
					// 使用文件创建时间或当前时间
					const createdTime = this.config.useFileCreationDate 
						? window.moment(file.stat.ctime).format(this.config.dateFormat)
						: window.moment().format(this.config.dateFormat);
					
					dataToAdd.created = createdTime;
					needsUpdate = true;
					createdCount++;
				}
				
				// 检查修改时间
				if (this.config.enableModifiedTime && !metadata?.frontmatter?.modified) {
					// 使用文件修改时间或当前时间
					const modifiedTime = this.config.useFileModificationDate 
						? window.moment(file.stat.mtime).format(this.config.dateFormat)
						: window.moment().format(this.config.dateFormat);
					
					dataToAdd.modified = modifiedTime;
					needsUpdate = true;
					modifiedCount++;
				}
				
				// 如果需要更新，一次性添加所有缺失的时间属性
				if (needsUpdate) {
					await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
						for (const key in dataToAdd) {
							frontmatter[key] = dataToAdd[key];
						}
					});
				}
			}
			
			// 关闭进度通知
			notice.hide();
			
			// 成功通知
			new Notice(`成功添加时间戳: ${createdCount} 个创建时间, ${modifiedCount} 个修改时间`);
		} catch (error) {
			console.error(`[${this.id}] 批量添加时间戳时出错:`, error);
			new Notice(`批量添加时间戳时出错: ${error.message}`);
		} finally {
			this.processingFile = false;
		}
	}
}

export * from './AutoTimestampsSettings';
