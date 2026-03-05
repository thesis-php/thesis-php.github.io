# Transaction

```php
/**
 * @template-covariant TTransaction of object
 */
interface Transaction
{
    /**
     * @var TTransaction
     */
    public object $inner { get; }

    public function commit(): void;

    public function rollback(): void;
}
```

## Installation

```shell
composer require thesis/transaction
```
