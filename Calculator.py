def add(a,b):
	return a+b
	
def sub (a,b):
	return a-b
	
def mul(a,b):
	return a*b
	
def div(a,b):
	return a/b

print("Enter the choice")
print("1 Addition")
print("2 substraction")
print("3 Multiplication")
print("4 Division")

p = int(input("Enter first number"))

q = int(input("Enter second number"))

choice=input(" Enter choice : 1/2/3/4 \t")

if choice=='1':
	print(add(p,q))
	
elif choice=='2':
	print(sub(p,q))
	
elif choice=='3':
	print(mul(p,q))
	
elif choice=='4':
	print(div(p,q))
	
else:
		print("Invalid")
