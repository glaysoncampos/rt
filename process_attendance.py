import pandas as pd
import matplotlib.pyplot as plt

def analyze_attendance(filepath):
    """
    Reads an Excel file, removes duplicates based on CPF,
    and generates a bar chart of attendance volume by department.
    """
    try:
        # Load the data
        df = pd.read_excel(filepath)
        print(f"Loaded {len(df)} records.")

        # Remove duplicates based on 'CPF'
        df_unique = df.drop_duplicates(subset=['CPF'])
        print(f"After removing duplicates: {len(df_unique)} records.")

        # Count occurrences by 'Departamento'
        department_counts = df_unique['Departamento'].value_counts()
        print("\nAttendance volume by Department:")
        print(department_counts)

        # Plot bar chart
        plt.figure(figsize=(10, 6))
        department_counts.plot(kind='bar', color='skyblue')
        plt.title('Volume de Atendimentos por Departamento')
        plt.xlabel('Departamento')
        plt.ylabel('Número de Atendimentos')
        plt.xticks(rotation=45)
        plt.tight_layout()

        # Save the chart
        output_file = 'attendance_chart.png'
        plt.savefig(output_file)
        plt.close()
        print(f"\nChart saved to '{output_file}'")

    except FileNotFoundError:
        print(f"Error: The file '{filepath}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    analyze_attendance('Atendimentos do Mês.xlsx')
