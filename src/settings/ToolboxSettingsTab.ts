import {App, PluginSettingTab, Modal, getLanguage} from 'obsidian';
import {Tool} from '../core/types/types';
import {ToolManager} from '../core/manager/ToolManager';
import {IconUtils} from '../utils/iconsUtils';
import {ToolTester} from '../../test/tool-tester';
import {ToolSettingsModal} from './ToolSettingsModal';
import {ToolSettingsTab} from './ToolSettingsTab';
import ToolboxPlugin from "../main";

/**
 * 工具箱设置选项卡类
 * 继承自 Obsidian 的 PluginSettingTab，提供插件的设置界面
 * 负责管理工具箱的整体设置和工具列表
 */
export class ToolboxSettingTab extends PluginSettingTab {
	/**
	 * 搜索查询字符串
	 */
	private searchQuery: string = '';

	/**
	 * 过滤后的工具列表
	 */
	private filteredTools: Tool[] = [];

	/**
	 * 工具管理器实例
	 */
	private toolManager: ToolManager;

	/**
	 * 构造函数
	 * @param app Obsidian 应用实例
	 * @param plugin 插件实例
	 */
	constructor(app: App, private plugin: ToolboxPlugin) {
		super(app, plugin);
		this.toolManager = new ToolManager(plugin);
	}

	/**
	 * 显示设置界面
	 * 创建并渲染插件的设置界面
	 */
	async display(): Promise<void> {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.addClass('toolbox');

		// 确保所有工具设置都已正确初始化
		if ('ensureAllToolSettings' in this.plugin) {
			await (this.plugin as any).ensureAllToolSettings();
		}

		// 重新加载设置以确保获取最新数据
		await this.plugin.loadSettings();

		// 添加标题
		containerEl.createEl('h1', {text: '工具箱', cls: 'otp-settings-title'});

		// 添加欢迎信息
		this.addWelcomeSection(containerEl);

		// 添加常规选项
		this.addGeneralSettings(containerEl);

		// 添加工具列表
		this.addToolsList(containerEl);
	}

	/**
	 * 添加欢迎信息部分
	 * @param containerEl 容器元素
	 */
	private addWelcomeSection(containerEl: HTMLElement) {
		const header = containerEl.createDiv({cls: 'otp-toolbox-header'});
		const headerContent = header.createDiv({cls: 'otp-header-content'});

		const welcomeText = headerContent.createEl('p');
		welcomeText.innerHTML = '欢迎使用工具箱插件，查看<a href="https://otp.tracingorigins.cn" target="_blank">官方文档</a>了解更多功能！';

		const versionContainer = headerContent.createDiv({cls: 'otp-version-container'});
		const version = versionContainer.createEl('p', {text: '版本号: 1.0.2', cls: 'otp-version-text'});
	}

	/**
	 * 添加常规设置部分
	 * 包括排序方式、视图模式、打开方式等设置
	 * @param containerEl 容器元素
	 */
	private addGeneralSettings(containerEl: HTMLElement): void {
		// 创建菜单结构
		const menu = containerEl.createDiv({cls: 'otp-toolbox-menu'});
		const menuHeader = menu.createDiv({cls: 'otp-menu-header otp-click-toggle'});
		const headerContent = menuHeader.createDiv({cls: 'otp-menu-header-content'});

		const titleContainer = headerContent.createDiv({cls: 'otp-menu-title-container'});
		const titleIcon = titleContainer.createDiv({cls: 'otp-menu-icon'});
		titleIcon.innerHTML = IconUtils.getSettingsIcon();
		titleContainer.createEl('h3', {text: '常规选项', cls: 'otp-settings-title'});

		const toggleButton = menuHeader.createEl('button', {cls: 'collapse-button clickable-icon'});
		toggleButton.innerHTML = IconUtils.getCollapseIcon();

		const dropdown = menu.createEl('div', {cls: 'otp-dropdown-content'});
		const settingsGrid = dropdown.createDiv({cls: 'otp-settings-grid'});

		// 如果设置了自动折叠，则初始状态下折叠
		if (this.plugin.settings.autoCollapseGeneralSettings) {
			dropdown.classList.add('hidden');
			toggleButton.classList.add('collapsed');
			toggleButton.innerHTML = IconUtils.getExpandIcon();
		}

		// 切换菜单显示/隐藏
		menuHeader.onclick = () => {
			dropdown.classList.toggle('hidden');
			toggleButton.classList.toggle('collapsed');
			toggleButton.innerHTML = toggleButton.classList.contains('collapsed')
				? IconUtils.getExpandIcon()
				: IconUtils.getCollapseIcon();
		};

		// 创建设置项的辅助方法
		const createSetting = (icon: string, title: string, description: string, content: (container: HTMLElement) => void) => {
			const container = settingsGrid.createDiv({cls: 'otp-setting-container otp-card'});
			const header = container.createDiv({cls: 'otp-tool-header'});

			// 左侧内容
			const left = header.createDiv({cls: 'otp-tool-left'});
			const iconDiv = left.createDiv({cls: 'otp-tool-icon'});
			iconDiv.innerHTML = icon;
			const info = left.createDiv({cls: 'otp-tool-info'});
			info.createEl('h4', {text: title, cls: 'otp-tool-title'});

			// 右侧内容
			const right = header.createDiv({cls: 'otp-tool-right'});
			content(right);

			// 描述
			const descContainer = container.createDiv({cls: 'otp-setting-description'});
			descContainer.createEl('p', {text: description});
		};

		// 自动折叠设置
		createSetting(
			IconUtils.getCollapseIcon(),
			'自动折叠常规选项',
			'设置页面打开时自动折叠常规选项',
			(right) => {
				const toggle = right.createEl('div', {cls: 'toggle-container'});
				const toggleEl = toggle.createEl('div', {cls: 'toggle'});
				if (this.plugin.settings.autoCollapseGeneralSettings) {
					toggleEl.classList.add('is-enabled');
				}
				toggleEl.addEventListener('click', async () => {
					toggleEl.classList.toggle('is-enabled');
					await this.plugin.updateSettings({
						autoCollapseGeneralSettings: toggleEl.classList.contains('is-enabled')
					});
				});
			}
		);

		// 工具测试
		createSetting(
			IconUtils.getTestIcon(),
			'工具测试',
			'测试所有工具功能是否正常',
			(right) => {
				const button = right.createEl('button', {
					cls: 'otp-test-button mod-cta',
					attr: {'aria-label': '运行测试'}
				});
				const buttonIcon = button.createDiv({cls: 'otp-button-icon'});
				buttonIcon.innerHTML = IconUtils.getTestIcon();
				button.createSpan({text: '运行测试', cls: 'otp-button-text'});
				button.addEventListener('click', () => this.runToolTests());
			}
		);

		// 排序方式设置
		createSetting(
			IconUtils.getSortIcon(),
			'排序方式',
			'选择工具列表的排序方式',
			(right) => {
				const dropdown = right.createEl('select', {cls: 'dropdown'});
				dropdown.createEl('option', {text: '按名称', value: 'name'});
				dropdown.createEl('option', {text: '按启用状态', value: 'enabled'});
				dropdown.value = this.plugin.settings.sortBy;
				dropdown.addEventListener('change', async () => {
					await this.plugin.updateSettings({sortBy: dropdown.value as 'name' | 'enabled'});
					this.display();
				});
			}
		);

		// 视图模式设置
		createSetting(
			IconUtils.getViewIcon(),
			'视图模式',
			'选择工具列表的视图模式',
			(right) => {
				const dropdown = right.createEl('select', {cls: 'dropdown'});
				dropdown.createEl('option', {text: '列表视图', value: 'list'});
				dropdown.createEl('option', {text: '网格视图', value: 'grid'});
				dropdown.value = this.plugin.settings.viewMode;
				dropdown.addEventListener('change', async () => {
					await this.plugin.updateSettings({viewMode: dropdown.value as 'list' | 'grid'});
					this.display();
				});
			}
		);

		// 打开方式设置
		createSetting(
			IconUtils.getOpenIcon(),
			'打开方式',
			'选择工具设置的打开方式',
			(right) => {
				const dropdown = right.createEl('select', {cls: 'dropdown'});
				dropdown.createEl('option', {text: '标签页', value: 'tab'});
				dropdown.createEl('option', {text: '模态框', value: 'modal'});
				dropdown.value = this.plugin.settings.openMode;
				dropdown.addEventListener('change', async () => {
					await this.plugin.updateSettings({openMode: dropdown.value as 'tab' | 'modal'});
					this.display();
				});
			}
		);

		// 搜索设置
		createSetting(
			IconUtils.getSearchIcon(),
			'快速搜索',
			'快速搜索工具',
			(right) => {
				const input = right.createEl('input', {
					type: 'text',
					cls: 'text-input',
					placeholder: '搜索工具...'
				});
				input.value = this.searchQuery;
				input.addEventListener('input', () => {
					this.searchQuery = input.value.toLowerCase();
					this.filterTools();
					this.renderToolsList(containerEl);
				});
			}
		);
	}

	/**
	 * 添加工具列表部分
	 * 显示所有可用的工具及其状态
	 * @param containerEl 容器元素
	 */
	private addToolsList(containerEl: HTMLElement): void {
		// 创建工具列表菜单
		const menu = containerEl.createDiv({cls: 'otp-toolbox-menu'});
		const menuHeader = menu.createDiv({cls: 'otp-menu-header otp-click-toggle'});
		const headerContent = menuHeader.createDiv({cls: 'otp-menu-header-content'});

		const titleContainer = headerContent.createDiv({cls: 'otp-menu-title-container'});
		const titleIcon = titleContainer.createDiv({cls: 'otp-menu-icon'});
		titleIcon.innerHTML = IconUtils.getToolsIcon();
		titleContainer.createEl('h3', {text: '工具列表', cls: 'otp-settings-title'});

		const toggleButton = menuHeader.createEl('button', {cls: 'collapse-button clickable-icon'});
		toggleButton.innerHTML = IconUtils.getCollapseIcon();

		const toolsContent = menu.createEl('div', {cls: 'otp-tools-content'});
		const toolsContainer = toolsContent.createDiv({cls: 'otp-tools-container'});
		toolsContainer.addClass(this.plugin.settings.viewMode);

		menuHeader.onclick = () => {
			toolsContent.classList.toggle('hidden');
			toggleButton.classList.toggle('collapsed');
			if (toggleButton.classList.contains('collapsed')) {
				toggleButton.innerHTML = IconUtils.getExpandIcon();
			} else {
				toggleButton.innerHTML = IconUtils.getCollapseIcon();
			}
		};

		// 渲染工具列表
		this.renderToolsList(containerEl);
	}

	/**
	 * 获取排序后的工具列表
	 * @param sortBy 排序方式：'name'按名称排序，'enabled'按启用状态排序
	 * @returns 排序后的工具实例数组
	 */
	getSortedTools(sortBy: 'name' | 'enabled'): Tool[] {
		// 获取语言
		const language = getLanguage();

		const tools = this.toolManager.getAllTools();
		if (sortBy === 'name') {
				// 如果语言是中文，使用排序名称sortName排序，否则使用名称name排序
				if (language === 'zh-CN') {
					return tools.sort((a, b) => a.sortName.localeCompare(b.sortName));
				} else {
					return tools.sort((a, b) => a.sortName.localeCompare(b.sortName));
				}
		} else {
			return tools.sort((a, b) => {
				if (a.config.enabled === b.config.enabled) {
					return a.sortName.localeCompare(b.sortName);
				}
				return a.config.enabled ? -1 : 1;
			});
		}
	}

	/**
	 * 过滤工具列表
	 * 根据搜索查询过滤工具列表
	 */
	private filterTools(): void {
		const tools = this.getSortedTools(this.plugin.settings.sortBy);
		if (this.searchQuery) {
			this.filteredTools = tools.filter(tool =>
				tool.name.toLowerCase().includes(this.searchQuery) ||
				tool.description.toLowerCase().includes(this.searchQuery)
			);
		} else {
			this.filteredTools = tools;
		}
	}

	/**
	 * 渲染工具列表
	 * 根据当前设置和过滤条件渲染工具列表
	 * @param containerEl 容器元素
	 */
	private async renderToolsList(containerEl: HTMLElement): Promise<void> {
		// 获取工具列表容器
		const toolsContainer = containerEl.querySelector('.otp-tools-container');
		if (!toolsContainer) return;

		// 清空工具列表
		toolsContainer.empty();

		// 获取过滤后的工具列表
		this.filterTools();
		const tools = this.filteredTools;

		// 如果没有工具，显示提示信息
		if (tools.length === 0) {
			const noToolsMessage = toolsContainer.createDiv({cls: 'otp-no-tools-message'});
			noToolsMessage.createEl('p', {text: '没有找到匹配的工具'});
			return;
		}

		// 渲染工具列表
		for (const tool of tools) {
			// 确保获取最新的工具配置
			const currentToolSettings = this.plugin.toolManager.getToolSettings(tool.id);
			if (currentToolSettings) {
				tool.config = currentToolSettings.config;
			}

			const toolItem = toolsContainer.createDiv({cls: 'otp-tool-item otp-card'});

			// 创建工具项头部
			const toolHeader = toolItem.createDiv({cls: 'otp-tool-header'});

			// 左侧：图标和标题
			const toolLeft = toolHeader.createDiv({cls: 'otp-tool-left'});
			const toolIcon = toolLeft.createDiv({cls: 'otp-tool-icon'});
			toolIcon.innerHTML = this.getToolIcon(tool.id);
			const toolInfo = toolLeft.createDiv({cls: 'otp-tool-info'});
			toolInfo.createEl('h4', {text: tool.name, cls: 'otp-tool-title'});

			// 右侧：开关和设置按钮
			const toolRight = toolHeader.createDiv({cls: 'otp-tool-right'});

			// 添加工具开关
			const toolToggle = toolRight.createDiv({cls: 'otp-tool-toggle'});
			const toggle = toolToggle.createEl('div', {cls: 'otp-toggle'});
			
			// 根据工具配置设置开关状态
			if (tool.config.enabled) {
				toggle.addClass('otp-toggle-enabled');
			}

			// 添加工具设置按钮
			const settingsContainer = toolRight.createDiv({cls: 'otp-tool-settings'});
			const settingsButton = settingsContainer.createEl('button', {
				cls: 'otp-settings-button',
				attr: {'aria-label': '设置'}
			});
			settingsButton.innerHTML = IconUtils.getSettingsIcon();

			// 添加工具描述
			const toolDescription = toolItem.createDiv({cls: 'otp-tool-description-container'});
			toolDescription.createEl('p', {text: tool.description, cls: 'otp-tool-description'});

			// 添加点击事件
			toolItem.addEventListener('click', () => {
				if (this.plugin.settings.openMode === 'modal') {
					new ToolSettingsModal(this.app, tool, this.plugin, this.toolManager).open();
				} else {
					const toolDetailTab = new ToolSettingsTab(
						this.app,
						containerEl,
						tool,
						this.plugin,
						() => this.display()
					);
					toolDetailTab.display();
				}
			});

			// 添加开关点击事件
			toggle.addEventListener('click', async (e: MouseEvent) => {
				e.stopPropagation();
				const newEnabledState = !tool.config.enabled;

				// 更新工具状态
				await this.plugin.updateToolStatus(tool.id, newEnabledState);

				// 更新UI状态
				if (newEnabledState) {
					toggle.addClass('otp-toggle-enabled');
				} else {
					toggle.removeClass('otp-toggle-enabled');
				}

				// 更新工具配置状态
				tool.config.enabled = newEnabledState;

				// 重新渲染工具列表以更新所有工具状态
				this.renderToolsList(containerEl);
			});

			// 添加设置按钮点击事件
			settingsButton.addEventListener('click', (e: MouseEvent) => {
				e.stopPropagation();
				if (this.plugin.settings.openMode === 'modal') {
					new ToolSettingsModal(this.app, tool, this.plugin, this.toolManager).open();
				} else {
					const toolDetailTab = new ToolSettingsTab(
						this.app,
						containerEl,
						tool,
						this.plugin,
						() => this.display()
					);
					toolDetailTab.display();
				}
			});
		}
	}

	/**
	 * 获取工具图标
	 * 根据工具ID返回对应的图标HTML
	 * @param toolId 工具ID
	 * @returns 图标的HTML字符串
	 */
	private getToolIcon(toolId: string): string {
		// 根据工具 ID 返回对应的图标
		switch (toolId) {
			case 'auto-timestamps':
				return IconUtils.getTimeIcon();
			case 'tab-copy':
				return IconUtils.getCopyIcon();
			case 'template':
				return IconUtils.getTemplateIcon();
			default:
				return IconUtils.getDefaultIcon();
		}
	}

	/**
	 * 运行工具测试
	 * 测试所有工具的功能是否正常
	 */
	private runToolTests(): void {
		const tools = this.toolManager.getAllTools();
		const results = ToolTester.testTools(tools, this.plugin);
		const report = ToolTester.getTestReport(results);

		// 显示测试结果
		const modal = new Modal(this.app);
		modal.titleEl.setText('工具测试结果');

		const contentEl = modal.contentEl;
		contentEl.empty();

		const reportEl = contentEl.createEl('pre', {cls: 'otp-test-report'});
		reportEl.setText(report);

		modal.open();
	}
}
