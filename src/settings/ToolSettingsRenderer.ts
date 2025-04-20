import {Tool} from '../core/types/types';
import {IconUtils} from '../utils/iconsUtils';
import ToolboxPlugin from "../main";

/**
 * 工具设置渲染器
 * 用于处理工具设置的UI渲染逻辑
 */
export class ToolSettingsRenderer {
    /**
     * 初始化工具设置
     * 从 data.json 中读取设置数据
     * @param plugin 插件实例
     */
    public static async initializeToolSettings(plugin: ToolboxPlugin): Promise<void> {
        try {
            // 从 data.json 中读取设置
            const data = await plugin.loadData();
            console.log('从data.json加载的设置数据:', data);

            if (data) {
                // 更新每个工具的设置
                for (const tool of plugin.toolManager.getAllTools()) {
                    const toolSettings = data[tool.id];
                    if (toolSettings) {
                        console.log(`加载工具 ${tool.id} 的设置:`, toolSettings);
                        // 使用深拷贝避免引用问题
                        tool.config = JSON.parse(JSON.stringify(toolSettings));
                    } else {
                        console.log(`工具 ${tool.id} 没有找到保存的设置，使用默认设置`);
                        tool.config = tool.getDefaultConfig();
                    }
                }
            } else {
                console.log('没有找到保存的设置数据，使用默认设置');
                // 如果没有保存的设置，使用默认设置
                for (const tool of plugin.toolManager.getAllTools()) {
                    tool.config = tool.getDefaultConfig();
                }
            }
        } catch (error) {
            console.error('加载工具设置时出错:', error);
            // 出错时使用默认设置
            for (const tool of plugin.toolManager.getAllTools()) {
                tool.config = tool.getDefaultConfig();
            }
        }
    }

    /**
     * 渲染工具设置的标题栏
     * @param containerEl 容器元素
     * @param toolName 工具名称
     * @param onBack 返回按钮的回调函数
     */
    public static renderTitleBar(containerEl: HTMLElement, toolName: string, onBack: () => void): void {
        // 创建标题栏容器
        const titleBar = containerEl.createDiv({cls: 'otp-title-bar'});

        // 创建返回按钮容器
        const backButtonContainer = titleBar.createDiv({cls: 'otp-back-button-container'});

        // 创建返回按钮，添加文本和边框样式
        const backButton = backButtonContainer.createEl('button', {
            cls: 'otp-back-button',
            attr: {'aria-label': '返回'}
        });

        // 添加返回图标
        const backIcon = backButton.createDiv({cls: 'otp-back-icon'});
        backIcon.innerHTML = IconUtils.getBackIcon();

        // 添加返回文本
        const backText = backButton.createSpan({text: '返回', cls: 'otp-back-text'});

        backButton.onclick = onBack;

        // 添加标题
        titleBar.createEl('h1', {text: `${toolName} 设置`, cls: 'otp-settings-title'});
    }

    /**
     * 渲染工具设置容器
     * @param containerEl 容器元素
     * @param tool 工具实例
     */
    public static renderSettingsContainer(containerEl: HTMLElement, tool: Tool): void {
		// 创建设置容器，使用与模态框相同的类
		// const settingsContainer = containerEl.createDiv({cls: 'otp-tool-settings'});
		const settingsContainer = containerEl.createDiv({cls: 'otp-tool-settings-modal'});
        tool.displaySettings(settingsContainer);
    }
} 
