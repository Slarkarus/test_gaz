import os
import sys

def is_target_file(filename):
    """Проверяет, соответствует ли файл целевому расширению/имени."""
    target_names = {
        'Makefile',
        'CMakeLists.txt',
        'migrations.txt',
        'Dockerfile_app',
        'Dockerfile_db',
        '.env'
    }
    target_extensions = {
        '.md', '.cpp', '.hpp', 
        '.yaml', '.sql', '.js', '.json'
    }
    return (filename in target_names or 
            os.path.splitext(filename)[1] in target_extensions)

def main():
    output_file = 'archive.txt'
    
    try:
        with open(output_file, 'w', encoding='utf-8') as out_f:
            for root, _, files in os.walk('.'):
                for filename in files:
                    if not is_target_file(filename):
                        continue
                    
                    full_path = os.path.join(root, filename)
                    rel_path = os.path.relpath(full_path, start='.')
                    
                    try:
                        with open(full_path, 'r', encoding='utf-8') as in_f:
                            content = in_f.read()
                    except UnicodeDecodeError:
                        with open(full_path, 'r', encoding='utf-8', errors='replace') as in_f:
                            content = in_f.read()
                    except Exception as e:
                        content = f"<ERROR READING FILE: {str(e)}>"
                    
                    # Записываем путь и содержимое
                    out_f.write(f"{rel_path}\n")
                    out_f.write(content)
                    
                    # Добавляем разделитель если нужно
                    if not content.endswith('\n'):
                        out_f.write('\n')
                    out_f.write('\n')
        
        print(f"Архив создан: {output_file}")
        return 0
    except Exception as e:
        print(f"Ошибка: {str(e)}", file=sys.stderr)
        return 1

if __name__ == '__main__':
    sys.exit(main())
