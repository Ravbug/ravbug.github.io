#include <iostream>
using namespace std;
int main(){
	string word;
	cout << "const words = [\n";
	while (cin >> word){
		if (word.size() == 5){
			cout << '"' << word << '"'<< ",\n";
		}
	}
	cout << "]";
}