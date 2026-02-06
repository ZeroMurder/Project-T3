import tkinter as tk
from tkinter import ttk, messagebox
import random
import time

class FakeRAT:
    def __init__(self, root):
        self.root = root
        self.root.title("Fake RAT v1.0 - Demo Only")
        self.root.geometry("1200x800")
        self.root.configure(bg="#1a1a1a")
        
        # Цвета в стиле скриншота
        self.bg_color = "#1a1a1a"
        self.panel_color = "#2a2a2a"
        self.accent_color = "#00ff88"
        self.text_color = "#ffffff"
        
        self.root.configure(bg=self.bg_color)
        
        self.fake_sessions = []  # Имитация сессий
        
        self.create_widgets()
        self.simulate_activity()
    
    def create_widgets(self):
        # Верхняя панель
        top_frame = tk.Frame(self.root, bg=self.bg_color, height=50)
        top_frame.pack(fill="x", pady=(0, 10))
        top_frame.pack_propagate(False)
        
        tk.Label(top_frame, text="Fake RAT v1.0", font=("Arial", 16, "bold"), fg=self.accent_color, bg=self.bg_color).pack(side="left", padx=20, pady=10)
        tk.Label(top_frame, text="27.02.2024 04:00", font=("Arial", 9), fg="#888", bg=self.bg_color).pack(side="right", padx=20, pady=10)
        
        # Главный контейнер
        main_frame = tk.Frame(self.root, bg=self.bg_color)
        main_frame.pack(fill="both", expand=True, padx=20, pady=(0, 20))
        
        # Левая панель (Список сессий)
        left_panel = tk.Frame(main_frame, bg=self.panel_color, width=250)
        left_panel.pack(side="left", fill="y", padx=(0, 10))
        left_panel.pack_propagate(False)
        
        tk.Label(left_panel, text="Сессии", font=("Arial", 12, "bold"), fg=self.text_color, bg=self.panel_color).pack(pady=10)
        
        self.session_listbox = tk.Listbox(left_panel, bg=self.panel_color, fg=self.text_color, selectbackground=self.accent_color, font=("Arial", 10))
        self.session_listbox.pack(fill="both", expand=True, padx=10, pady=(0, 10))
        self.session_listbox.bind("<<ListboxSelect>>", self.on_session_select)
        
        btn_frame = tk.Frame(left_panel, bg=self.panel_color)
        btn_frame.pack(fill="x", padx=10, pady=(0, 10))
        
        tk.Button(btn_frame, text="Обновить", bg=self.panel_color, fg=self.text_color, font=("Arial", 9), command=self.refresh_sessions).pack(fill="x", pady=2)
        tk.Button(btn_frame, text="Добавить", bg=self.panel_color, fg=self.text_color, font=("Arial", 9), command=self.add_fake_session).pack(fill="x", pady=2)
        tk.Button(btn_frame, text="Удалить", bg="#ff4444", fg=self.text_color, font=("Arial", 9), command=self.delete_session).pack(fill="x", pady=2)
        
        # Правая панель (Главный контент)
        right_frame = tk.Frame(main_frame, bg=self.bg_color)
        right_frame.pack(side="right", fill="both", expand=True)
        
        # Панель вкладок
        notebook = ttk.Notebook(right_frame)
        notebook.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Вкладка "Задачи"
        tasks_frame = tk.Frame(notebook, bg=self.bg_color)
        notebook.add(tasks_frame, text="Задачи")
        
        tk.Label(tasks_frame, text="Файлы и директории", font=("Arial", 12, "bold"), fg=self.text_color, bg=self.bg_color).pack(anchor="w", padx=20, pady=(20, 10))
        
        # Treeview для файлов
        columns = ("Name", "Size", "Type")
        self.tree = ttk.Treeview(tasks_frame, columns=columns, show="headings", height=15)
        self.tree.heading("Name", text="Имя")
        self.tree.heading("Size", text="Размер")
        self.tree.heading("Type", text="Тип")
        self.tree.pack(fill="both", expand=True, padx=20, pady=(0, 20))
        
        # Кнопки файлов
        file_btn_frame = tk.Frame(tasks_frame, bg=self.bg_color)
        file_btn_frame.pack(fill="x", padx=20)
        tk.Button(file_btn_frame, text="Обновить", bg=self.panel_color, fg=self.text_color, command=self.refresh_files).pack(side="left", padx=(0, 10))
        tk.Button(file_btn_frame, text="Загрузить файл", bg=self.panel_color, fg=self.text_color, command=self.fake_upload).pack(side="left")
        
        # Вкладка "Shell"
        shell_frame = tk.Frame(notebook, bg=self.bg_color)
        notebook.add(shell_frame, text="Shell")
        
        tk.Label(shell_frame, text="Командная строка", font=("Arial", 12, "bold"), fg=self.text_color, bg=self.bg_color).pack(anchor="w", padx=20, pady=(20, 10))
        
        self.shell_output = tk.Text(shell_frame, bg=self.panel_color, fg=self.text_color, height=20, font=("Consolas", 10))
        self.shell_output.pack(fill="both", expand=True, padx=20, pady=(0, 10))
        
        shell_input_frame = tk.Frame(shell_frame, bg=self.bg_color)
        shell_input_frame.pack(fill="x", padx=20, pady=(0, 20))
        self.shell_entry = tk.Entry(shell_input_frame, bg=self.panel_color, fg=self.text_color, font=("Consolas", 10), insertbackground=self.text_color)
        self.shell_entry.pack(side="left", fill="x", expand=True)
        self.shell_entry.bind("<Return>", self.execute_fake_command)
        tk.Button(shell_input_frame, text="Выполнить", bg=self.accent_color, fg="#000", font=("Arial", 9)).pack(side="right", padx=(10, 0))
    
    def add_fake_session(self):
        session_id = f"PC-{random.randint(1000, 9999)}"
        self.fake_sessions.append(session_id)
        self.session_listbox.insert(0, session_id)
    
    def refresh_sessions(self):
        self.session_listbox.delete(0, tk.END)
        for _ in range(random.randint(1, 5)):
            self.add_fake_session()
    
    def on_session_select(self, event):
        selection = self.session_listbox.curselection()
        if selection:
            messagebox.showinfo("Инфо", f"Выбрана сессия: {self.session_listbox.get(selection[0])} (фейк)")
    
    def delete_session(self):
        selection = self.session_listbox.curselection()
        if selection:
            self.session_listbox.delete(selection[0])
    
    def refresh_files(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        fake_files = [
            ("folder1", "1.2 KB", "Папка"),
            ("document.txt", "5.3 KB", "Файл"),
            ("image.jpg", "2.1 MB", "Изображение"),
            ("system.dll", "150 KB", "DLL")
        ]
        for name, size, typ in fake_files:
            self.tree.insert("", "end", values=(name, size, typ))
    
    def fake_upload(self):
        messagebox.showinfo("Загрузка", "Имитация загрузки файла... Готово! (фейк)")
    
    def execute_fake_command(self, event):
        cmd = self.shell_entry.get()
        self.shell_entry.delete(0, tk.END)
        self.shell_output.insert(tk.END, f"> {cmd}\n")
        time.sleep(0.5)  # Имитация задержки
        fake_output = f"Команда '{cmd}' выполнена. Результат: OK (фейк)\n"
        self.shell_output.insert(tk.END, fake_output)
        self.shell_output.see(tk.END)
    
    def simulate_activity(self):
        def blink():
            # Мигающая активность
            self.root.after(2000 + random.randint(0, 5000), blink)
        blink()
        self.refresh_sessions()
        self.refresh_files()

if __name__ == "__main__":
    root = tk.Tk()
    app = FakeRAT(root)
    root.mainloop()
