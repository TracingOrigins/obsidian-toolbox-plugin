import { Notice } from 'obsidian';
import { ToolConfig } from '../../core/types/types';
import { ToolCommandConfig } from '../../core/types/types';
import { BaseTool } from '../../core/base/BaseTool';
import { displayTabCopySettings } from './TabCopySettings';
import ToolboxPlugin from "../../main";

/**
 * 标签页复制工具配置接口
 * 定义了该工具特有的配置选项
 */
export interface TabCopyConfig extends ToolConfig {
	/**
	 * 是否启用双击标签页复制链接功能
	 * 启用后可以通过双击标签页来复制其链接
	 */
	enableDoubleClick: boolean;
}

/**
 * 标签页复制工具类
 * 提供了复制当前标签页链接的功能
 */
export class TabCopyTool extends BaseTool<TabCopyConfig> {
	/**
	 * 工具唯一ID
	 */
	id = 'tab-copy';
	/**
	 * 工具显示名称
	 */
	name = '标签页复制';
	/**
	 * 工具描述
	 */
	description = '复制标签页内容的链接';

	/**
	 * DOM观察器
	 * 用于监听标签页变化
	 */
	private observer: MutationObserver | undefined;

	/**
	 * 构造函数
	 * @param plugin 插件实例引用
	 */
	constructor(plugin: ToolboxPlugin) {
		super(plugin);
		
		// // 初始化日志

		// // 确保配置项存在
		// this.config = {
		// 	...this.getDefaultConfig(),
		// 	...this.config
		// };
		
		// // 立即保存初始配置，确保它在data.json中
		// this.saveSettings().then(() => {
		// });
	}

	/**
	 * 注册工具命令
	 * 在Obsidian命令面板中添加相关命令
	 */
	private registerToolCommands(): void {
		// 定义命令
		const commands: ToolCommandConfig[] = [
			{
				id: 'copy-link',
				name: '复制链接',
				checkCallback: (checking: boolean) => {
					// 首先检查工具是否启用
					if (!this.config.enabled) {
						return false; // 如果工具禁用，命令不可用（不会在命令面板显示）
					}

					// 只检查可用性，不执行命令
					if (checking) {
						return true;
					}
					
					// 实际执行命令
					this.copyLink();
					return true;
				}
			}
		];
		
		// 注册命令到工具管理器
		(this.plugin.toolManager as any).registerToolCommands(this.id, commands);
	}

	/**
	 * 启用工具
	 * 注册事件监听器和命令
	 */
	enable(): void {

		// 注册复制链接命令
		this.registerToolCommands();
		
		// 根据设置决定是否启用双击功能
		if (this.config.enableDoubleClick) {
			this.addDoubleClickListener();
		}

		// 创建DOM观察器，确保标签页切换后仍能正常工作
		this.observer = new MutationObserver(() => {
			if (this.config.enableDoubleClick) {
				this.addDoubleClickListener();
			} else {
				this.removeDoubleClickListener();
			}
		});

		// 开始监听DOM变化
		this.observer.observe(document.body, { childList: true, subtree: true });
		
	}

	/**
	 * 禁用工具
	 * 移除事件监听器和命令
	 */
	disable(): void {

		// 移除事件监听器
		this.removeDoubleClickListener();

		// 停止DOM观察
		if (this.observer) {
			this.observer.disconnect();
		}
		
		// 注销命令
		(this.plugin.toolManager as any).unregisterToolCommands(this.id);
		
	}

	/**
	 * 获取默认配置
	 * @returns 默认配置对象
	 */
	getDefaultConfig(): TabCopyConfig {
		return {
			enabled: false,
			enableDoubleClick: true
		};
	}

	/**
	 * 验证配置有效性
	 * @param config 要验证的配置对象
	 * @returns 配置是否有效
	 */
	validateConfig(config: TabCopyConfig): boolean {
		return (
			typeof config.enabled === 'boolean' &&
			typeof config.enableDoubleClick === 'boolean'
		);
	}

	/**
	 * 配置变更处理
	 * 当配置发生变化时调用，处理工具状态改变
	 * @param config 新的配置对象
	 */
	onConfigChange(config: TabCopyConfig): void {
		// 保存旧的配置
		const oldConfig = {...this.config};
		
		// 调用父类的onConfigChange，处理启用/禁用状态
		super.onConfigChange(config);

		// 如果双击设置发生变化，更新监听器
		if (oldConfig.enableDoubleClick !== config.enableDoubleClick) {
			if (config.enabled) {
				if (config.enableDoubleClick) {
					this.addDoubleClickListener();
					// 重新开始观察DOM变化
					if (this.observer) {
						this.observer.disconnect();
					}
					this.observer = new MutationObserver(() => {
						this.addDoubleClickListener();
					});
					this.observer.observe(document.body, { childList: true, subtree: true });
				} else {
					this.removeDoubleClickListener();
					// 停止观察DOM变化
					if (this.observer) {
						this.observer.disconnect();
						this.observer = undefined;
					}
				}
			}
		}
	}

	/**
	 * 显示工具设置界面
	 * @param containerEl 设置容器元素
	 */
	displaySettings(containerEl: HTMLElement): void {
		displayTabCopySettings(containerEl, this.plugin, this);
	}

	/**
	 * 添加双击事件监听器
	 * 为当前活动的标签页添加双击事件
	 */
	addDoubleClickListener() {
		this.removeDoubleClickListener(); // 先清除现有监听器，避免重复

		// 定位当前激活的标签页
		const activeTab = document.querySelector('.workspace-tab-header.tappable.is-active.mod-active') as HTMLElement;
		if (activeTab) {
			activeTab.addEventListener('dblclick', this.handleDoubleClick);
		}
	}

	/**
	 * 移除双击事件监听器
	 * 从当前活动的标签页移除双击事件
	 */
	removeDoubleClickListener() {
		const activeTab = document.querySelector('.workspace-tab-header.tappable.is-active.mod-active') as HTMLElement;
		if (activeTab) {
			activeTab.removeEventListener('dblclick', this.handleDoubleClick);
		}
	}

	/**
	 * 双击事件处理函数
	 * 当标签页被双击时调用复制链接功能
	 */
	handleDoubleClick = () => {
		this.copyLink();
	}

	/**
	 * 核心功能：复制链接到剪贴板
	 * 根据标签页类型生成并复制适当格式的链接
	 */
	copyLink() {
		// 定位当前激活的标签页
		const activeTab = document.querySelector('.workspace-tab-header.tappable.is-active.mod-active') as HTMLElement;
		if (activeTab) {
			// 精确获取标签页标题（从标题内部元素获取更可靠）
			const tabTitle = (document.querySelector('.workspace-tab-header.tappable.is-active.mod-active .workspace-tab-header-inner-title') as HTMLElement).innerText;
			const dataType = activeTab.getAttribute('data-type'); // 获取标签页类型

			if (dataType === 'webviewer') {
				// 处理网页查看器标签页
				const webviewContent = document.querySelector('.view-content.webviewer-content webview') as HTMLElement;
				const tabLink = webviewContent ? webviewContent.getAttribute('src') : '';

				// 生成Markdown格式链接
				const markdownLink = `[${tabTitle}](${tabLink})`;

				// 复制到剪贴板并显示结果
				navigator.clipboard.writeText(markdownLink).then(
					() => {
						new Notice('已复制 Markdown 链接: ' + markdownLink);
					},
					() => {
						new Notice('复制失败，请重试');
					}
				);
			} else if (dataType === 'markdown') {
				// 处理Markdown笔记标签页
				const wikiLink = `[[${tabTitle}]]`;

				// 复制到剪贴板并显示结果
				navigator.clipboard.writeText(wikiLink).then(
					() => {
						new Notice('已复制 Wiki 链接: ' + wikiLink);
					},
					() => {
						new Notice('复制失败，请重试');
					}
				);
			}
		} else {
			// 未找到激活的标签页
			new Notice('未找到激活的标签页');
		}
	}
}

export * from './TabCopySettings';
