source: Annotated[
    Directory,
    Doc("The source folder; where the codebase is located"),
    DefaultPath("src")
]

config: Annotated[
    Directory,
    Doc("The folder container configuration files"),
    DefaultPath(".config")
]
