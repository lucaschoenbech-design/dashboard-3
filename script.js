// Dashboard JavaScript
class RepositoryDashboard {
    constructor() {
        this.files = [];
        this.currentFile = null;
        this.init();
    }

    init() {
        this.loadRepositoryFiles();
        this.bindEvents();
        this.updateStats();
    }

    async loadRepositoryFiles() {
        // In a real implementation, this would fetch from an API
        // For now, we'll simulate with the files we know exist
        this.files = [
            {
                name: 'README.md',
                type: 'file',
                path: './README.md',
                size: '21 B',
                icon: 'fas fa-file-alt',
                language: 'markdown',
                content: await this.fetchFileContent('README.md')
            },
            {
                name: 'index.html',
                type: 'file',
                path: './index.html',
                size: '5.2 KB',
                icon: 'fab fa-html5',
                language: 'html',
                content: await this.fetchFileContent('index.html')
            },
            {
                name: 'style.css',
                type: 'file',
                path: './style.css',
                size: '7.4 KB',
                icon: 'fab fa-css3-alt',
                language: 'css',
                content: await this.fetchFileContent('style.css')
            },
            {
                name: 'script.js',
                type: 'file',
                path: './script.js',
                size: '3.5 KB',
                icon: 'fab fa-js-square',
                language: 'javascript',
                content: await this.fetchFileContent('script.js')
            }
        ];

        this.renderFileTree();
        this.updateStats();
    }

    async fetchFileContent(filename) {
        try {
            const response = await fetch(filename);
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn(`Could not fetch ${filename}:`, error);
        }
        
        // Fallback content for demonstration
        switch (filename) {
            case 'README.md':
                return '# dashboard-3\ntest 3\n\nThis is an interactive repository dashboard that allows you to explore files in an elegant way.';
            case 'index.html':
                return '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Repository Dashboard</title>\n</head>\n<body>\n    <h1>Interactive Repository Dashboard</h1>\n</body>\n</html>';
            case 'style.css':
                return '/* Modern CSS styling for the dashboard */\nbody {\n    font-family: system-ui, sans-serif;\n    margin: 0;\n    padding: 0;\n}\n\n.dashboard {\n    display: grid;\n    height: 100vh;\n}';
            case 'script.js':
                return '// JavaScript for interactive functionality\nclass Dashboard {\n    constructor() {\n        this.init();\n    }\n\n    init() {\n        console.log("Dashboard initialized");\n    }\n}';
            default:
                return `// Content for ${filename}\n// This file contains the implementation details.`;
        }
    }

    renderFileTree() {
        const fileTree = document.getElementById('file-tree');
        fileTree.innerHTML = '';

        this.files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.path = file.path;
            
            fileItem.innerHTML = `
                <i class="${file.icon}"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${file.size}</span>
            `;

            fileItem.addEventListener('click', () => this.selectFile(file));
            fileTree.appendChild(fileItem);
        });
    }

    selectFile(file) {
        // Update active state
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const fileItem = document.querySelector(`[data-path="${file.path}"]`);
        if (fileItem) {
            fileItem.classList.add('active');
        }

        // Show file content
        this.currentFile = file;
        this.showFileContent(file);
    }

    showFileContent(file) {
        const welcomeScreen = document.getElementById('welcome-screen');
        const fileViewer = document.getElementById('file-viewer');
        
        welcomeScreen.style.display = 'none';
        fileViewer.style.display = 'flex';

        // Update file header
        document.getElementById('file-icon').className = `file-icon ${file.icon}`;
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = file.size;

        // Update file content
        const codeElement = document.getElementById('file-code');
        codeElement.textContent = file.content;
        codeElement.className = `language-${file.language}`;

        // Apply syntax highlighting
        if (window.Prism) {
            Prism.highlightElement(codeElement);
        }
    }

    updateStats() {
        const fileCount = this.files.filter(f => f.type === 'file').length;
        const folderCount = this.files.filter(f => f.type === 'folder').length;
        const totalLines = this.files.reduce((total, file) => {
            if (file.content) {
                return total + file.content.split('\n').length;
            }
            return total;
        }, 0);

        document.getElementById('file-count').textContent = fileCount;
        document.getElementById('folder-count').textContent = folderCount;
        document.getElementById('total-lines').textContent = totalLines;
    }

    bindEvents() {
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadRepositoryFiles();
        });

        // Search functionality
        const searchInput = document.getElementById('file-search');
        searchInput.addEventListener('input', (e) => {
            this.filterFiles(e.target.value);
        });

        // Copy content button
        document.getElementById('copy-content').addEventListener('click', () => {
            if (this.currentFile) {
                navigator.clipboard.writeText(this.currentFile.content).then(() => {
                    this.showNotification('Content copied to clipboard!');
                });
            }
        });

        // Download file button
        document.getElementById('download-file').addEventListener('click', () => {
            if (this.currentFile) {
                this.downloadFile(this.currentFile);
            }
        });
    }

    filterFiles(searchTerm) {
        const fileItems = document.querySelectorAll('.file-item');
        const term = searchTerm.toLowerCase();

        fileItems.forEach(item => {
            const fileName = item.querySelector('.file-name').textContent.toLowerCase();
            if (fileName.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    downloadFile(file) {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`${file.name} downloaded!`);
    }

    showNotification(message) {
        // Create and show a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation keyframes
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RepositoryDashboard();
});

// Add some interactive animations
document.addEventListener('DOMContentLoaded', () => {
    // Animate stats on load
    const animateValue = (element, start, end, duration) => {
        const startTimestamp = performance.now();
        const step = (timestamp) => {
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    };

    // Animate stats after a short delay
    setTimeout(() => {
        const fileCount = document.getElementById('file-count');
        const folderCount = document.getElementById('folder-count');
        const totalLines = document.getElementById('total-lines');
        
        if (fileCount) animateValue(fileCount, 0, parseInt(fileCount.textContent) || 4, 1000);
        if (folderCount) animateValue(folderCount, 0, parseInt(folderCount.textContent) || 0, 1000);
        if (totalLines) animateValue(totalLines, 0, parseInt(totalLines.textContent) || 200, 1500);
    }, 500);
});