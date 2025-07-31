from time import localtime, strftime

TIME_FORMAT = "%X"
SAVE_LOGS = True
PRINT_LOGS = True

def log(*texts, console_print=PRINT_LOGS, file_save=SAVE_LOGS):
    """
    this function save logs on new line in file logs.txt
    Format of text on line: "<Local time>: <text>" 
    """
    if not (SAVE_LOGS or PRINT_LOGS):
        return
    log_text = ""
    for text in texts:
        log_text += str(text) + " "
    log_text = strftime(TIME_FORMAT, localtime()) + ": " + log_text
    
    if file_save:
        try:
            file = open("logs.txt", "a")
        except FileNotFoundError:
            file = open("logs.txt", "w")
        file.write(log_text + "\n")
        file.close()
    if console_print:
        print(log_text)