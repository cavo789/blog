from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ELB

with Diagram("My Team", show=False, direction="TB"):
    (
        ELB("Olivier")
        >> [EC2("Christophe"), EC2("Jason"), EC2("Niki"), EC2("Rudy"), EC2("Stijn")]
        >> RDS("Work together")
    )
