import pandas as pd

# Create sample data
data = {
    'CPF': [
        '12345678901', '12345678901', '98765432109', '11223344556',
        '55667788990', '55667788990', '99887766554', '12312312312',
        '32132132132', '12345678901', '98765432109'
    ],
    'Departamento': [
        'Vendas', 'Vendas', 'Suporte', 'Financeiro',
        'RH', 'RH', 'TI', 'Vendas',
        'Suporte', 'Vendas', 'Suporte'
    ]
}

# Create DataFrame
df = pd.DataFrame(data)

# Save to Excel
df.to_excel('Atendimentos do Mês.xlsx', index=False)
print("Sample data created: 'Atendimentos do Mês.xlsx'")
