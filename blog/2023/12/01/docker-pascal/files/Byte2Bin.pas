Function Byte2Bin (Chiffre : Byte) : String;

Var I, Temp : Byte;
    St      : String;

Begin

   St := '';

   For I := 7 Downto 0 do Begin
       Temp := (Chiffre and (1 shl I));
       If (Temp = 0) then St := St + '0' Else St := St + '1';
   End;

   Byte2Bin := St;

End;

begin
    WriteLn( Byte2Bin(197) );
end.
