def merge_data(filename: str = "employees") -> None:
    # Initialize the merged DataFrame with the first year's data
    merged_df: pd.DataFrame = pd.read_csv(f"{filename}_2020.csv", sep=";")
    merged_df.rename(columns={'salary': 'salary_2020'}, inplace=True)

    # Iterate over remaining years and merge
    for year in range(2021, 2025):
        df_year = pd.read_csv(f"{filename}_{year}.csv", sep=";")

        # So, for the first run, rename column "salary" as "salary_2021"
        df_year.rename(columns={'salary': f'salary_{year}'}, inplace=True)

        # And merge both: for the first run, we'll retrieve all columns from files 2020 and append
        # the salary of 2021. And do the same across years
        merged_df = merged_df.merge(df_year, on=['id', 'first_name', 'last_name'], how='outer')

    # Save the merged DataFrame to a new CSV file
    merged_df.to_csv(f"{filename}_merged.csv", index=False, encoding="utf-8", sep=";")

merge_data("employees")
