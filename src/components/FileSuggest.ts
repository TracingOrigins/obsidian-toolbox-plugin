/**
 * 文件建议组件，用于提供文件选择的下拉建议功能
 * 继承自 Obsidian 的 FuzzySuggestModal，支持模糊搜索
 */
import {App, TFile, TFolder, FuzzySuggestModal} from 'obsidian';

export class FileSuggest extends FuzzySuggestModal<TFile> {
    /** 输入框元素 */
    public inputEl: HTMLInputElement;
    /** 允许的文件类型列表，为空表示允许所有类型 */
    private fileTypes: string[];

    /**
     * 构造函数
     * @param app Obsidian 应用实例
     * @param inputEl 输入框元素
     * @param fileTypes 允许的文件类型列表，默认为空数组（允许所有类型）
     */
    constructor(app: App, inputEl: HTMLInputElement, fileTypes: string[] = []) {
        super(app);
        this.inputEl = inputEl;
        this.fileTypes = fileTypes;

        // 添加点击事件监听器，点击输入框时打开建议模态框
        this.inputEl.addEventListener('click', () => {
            this.open();
        });
    }

    /**
     * 获取所有符合条件的文件列表
     * @returns 文件列表
     */
    getItems(): TFile[] {
        const files: TFile[] = [];
        this.addFiles(this.app.vault.getRoot(), files);
        return files;
    }

    /**
     * 递归添加文件夹中的文件
     * @param folder 当前文件夹
     * @param files 文件列表
     */
    private addFiles(folder: TFolder, files: TFile[]) {
        folder.children.forEach(child => {
            if (child instanceof TFile) {
                // 如果未指定文件类型或文件类型匹配，则添加到列表中
                if (this.fileTypes.length === 0 || this.fileTypes.some(type => child.extension === type)) {
                    files.push(child);
                }
            } else if (child instanceof TFolder) {
                // 如果是文件夹，递归处理
                this.addFiles(child, files);
            }
        });
    }

    /**
     * 获取文件在建议列表中的显示文本
     * @param file 文件对象
     * @returns 文件路径
     */
    getItemText(file: TFile): string {
        return file.path;
    }

    /**
     * 当用户选择文件时的处理函数
     * @param file 被选择的文件
     */
    onChooseItem(file: TFile): void {
        this.inputEl.value = file.path;
        // 触发 change 事件，通知其他组件值已改变
        this.inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
} 